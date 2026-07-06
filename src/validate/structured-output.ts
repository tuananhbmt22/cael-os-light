export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationError[] };

export interface ValidationError {
  path: string;
  message: string;
}

export interface Schema<T> {
  readonly name: string;
  validate(input: unknown, path?: string): Validated<T>;
}

type InferSchema<TSchema> = TSchema extends Schema<infer TValue> ? TValue : never;
type Shape = Record<string, Schema<unknown>>;
type InferShape<TShape extends Shape> = {
  [K in keyof TShape]: InferSchema<TShape[K]>;
};

const defaultPath = "$";

function valid<T>(value: T): Validated<T> {
  return { ok: true, value };
}

function invalid(path: string, message: string): Validated<never> {
  return { ok: false, errors: [{ path, message }] };
}

function mergeErrors(results: Validated<unknown>[]): ValidationError[] {
  return results.flatMap((result) => (result.ok ? [] : result.errors));
}

function typeName(input: unknown): string {
  if (input === null) return "null";
  if (Array.isArray(input)) return "array";
  return typeof input;
}

class ScalarSchema<T> implements Schema<T> {
  constructor(
    readonly name: string,
    private readonly guard: (input: unknown) => input is T,
    private readonly expected: string
  ) {}

  validate(input: unknown, path = defaultPath): Validated<T> {
    if (this.guard(input)) return valid(input);
    return invalid(path, `expected ${this.expected}, got ${typeName(input)}`);
  }
}

class LiteralSchema<T extends string | number | boolean | null> implements Schema<T> {
  readonly name: string;

  constructor(private readonly literalValue: T) {
    this.name = `literal(${String(literalValue)})`;
  }

  validate(input: unknown, path = defaultPath): Validated<T> {
    if (input === this.literalValue) return valid(this.literalValue);
    return invalid(path, `expected literal ${String(this.literalValue)}`);
  }
}

class ArraySchema<T> implements Schema<T[]> {
  readonly name: string;

  constructor(private readonly itemSchema: Schema<T>) {
    this.name = `array(${itemSchema.name})`;
  }

  validate(input: unknown, path = defaultPath): Validated<T[]> {
    if (!Array.isArray(input)) {
      return invalid(path, `expected array, got ${typeName(input)}`);
    }

    const values: T[] = [];
    const errors: ValidationError[] = [];
    for (let index = 0; index < input.length; index += 1) {
      const result = this.itemSchema.validate(input[index], `${path}[${index}]`);
      if (result.ok) values.push(result.value);
      else errors.push(...result.errors);
    }
    return errors.length > 0 ? { ok: false, errors } : valid(values);
  }
}

class UnionSchema<T> implements Schema<T> {
  readonly name: string;

  constructor(private readonly variants: Schema<T>[]) {
    this.name = `union(${variants.map((variant) => variant.name).join("|")})`;
  }

  validate(input: unknown, path = defaultPath): Validated<T> {
    const errors: ValidationError[] = [];
    for (const variant of this.variants) {
      const result = variant.validate(input, path);
      if (result.ok) return result;
      errors.push(...result.errors);
    }
    return {
      ok: false,
      errors: [
        {
          path,
          message: `matched no union variant: ${errors.map((error) => error.message).join("; ")}`
        }
      ]
    };
  }
}

class ObjectSchema<TShape extends Shape> implements Schema<InferShape<TShape>> {
  readonly name: string;

  constructor(
    private readonly fields: TShape,
    name = "object"
  ) {
    this.name = name;
  }

  validate(input: unknown, path = defaultPath): Validated<InferShape<TShape>> {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      return invalid(path, `expected object, got ${typeName(input)}`);
    }

    const source = input as Record<string, unknown>;
    const fieldNames = Object.keys(this.fields);
    const allowed = new Set(fieldNames);
    const output: Record<string, unknown> = {};
    const validations: Validated<unknown>[] = [];

    for (const fieldName of fieldNames) {
      const schema = this.fields[fieldName];
      if (!schema) continue;
      const result = schema.validate(source[fieldName], `${path}.${fieldName}`);
      validations.push(result);
      if (result.ok) output[fieldName] = result.value;
    }

    for (const key of Object.keys(source)) {
      if (!allowed.has(key)) {
        validations.push(invalid(`${path}.${key}`, "unexpected field"));
      }
    }

    const errors = mergeErrors(validations);
    if (errors.length > 0) return { ok: false, errors };
    return valid(output as InferShape<TShape>);
  }
}

class OptionalSchema<T> implements Schema<T | undefined> {
  readonly name: string;

  constructor(private readonly inner: Schema<T>) {
    this.name = `optional(${inner.name})`;
  }

  validate(input: unknown, path = defaultPath): Validated<T | undefined> {
    if (input === undefined) return valid(undefined);
    return this.inner.validate(input, path);
  }
}

class RecordSchema<T> implements Schema<Record<string, T>> {
  readonly name: string;

  constructor(private readonly valueSchema: Schema<T>) {
    this.name = `record(${valueSchema.name})`;
  }

  validate(input: unknown, path = defaultPath): Validated<Record<string, T>> {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      return invalid(path, `expected record, got ${typeName(input)}`);
    }
    const source = input as Record<string, unknown>;
    const output: Record<string, T> = {};
    const errors: ValidationError[] = [];
    for (const [key, value] of Object.entries(source)) {
      const result = this.valueSchema.validate(value, `${path}.${key}`);
      if (result.ok) output[key] = result.value;
      else errors.push(...result.errors);
    }
    return errors.length > 0 ? { ok: false, errors } : valid(output);
  }
}

class MatchingStringSchema implements Schema<string> {
  readonly name: string;

  constructor(private readonly pattern: RegExp) {
    this.name = `stringMatching(${pattern.source})`;
  }

  validate(input: unknown, path = defaultPath): Validated<string> {
    if (typeof input !== "string") {
      return invalid(path, `expected string, got ${typeName(input)}`);
    }
    if (!this.pattern.test(input)) {
      return invalid(path, `string did not match ${this.pattern.source}`);
    }
    return valid(input);
  }
}

export const s = {
  string(): Schema<string> {
    return new ScalarSchema("string", (input): input is string => typeof input === "string", "string");
  },
  number(): Schema<number> {
    return new ScalarSchema(
      "number",
      (input): input is number => typeof input === "number" && Number.isFinite(input),
      "finite number"
    );
  },
  boolean(): Schema<boolean> {
    return new ScalarSchema("boolean", (input): input is boolean => typeof input === "boolean", "boolean");
  },
  literal<T extends string | number | boolean | null>(value: T): Schema<T> {
    return new LiteralSchema(value);
  },
  union<T>(variants: Schema<T>[]): Schema<T> {
    return new UnionSchema(variants);
  },
  array<T>(schema: Schema<T>): Schema<T[]> {
    return new ArraySchema(schema);
  },
  enumOf<const T extends readonly [string, ...string[]]>(values: T): Schema<T[number]> {
    const allowed = new Set<string>(values);
    return new ScalarSchema(
      `enum(${values.join("|")})`,
      (input): input is T[number] => typeof input === "string" && allowed.has(input),
      `one of ${values.join(", ")}`
    );
  },
  optional<T>(schema: Schema<T>): Schema<T | undefined> {
    return new OptionalSchema(schema);
  },
  object<TShape extends Shape>(fields: TShape, name?: string): Schema<InferShape<TShape>> {
    return new ObjectSchema(fields, name);
  },
  record<T>(schema: Schema<T>): Schema<Record<string, T>> {
    return new RecordSchema(schema);
  },
  stringMatching(pattern: RegExp): Schema<string> {
    return new MatchingStringSchema(pattern);
  }
};

export function validate<T>(schema: Schema<T>, input: unknown): Validated<T> {
  return schema.validate(input);
}

export function validateOrDegrade<T>(
  schema: Schema<T>,
  input: unknown,
  log: (errors: ValidationError[]) => void
): T | null {
  try {
    const result = schema.validate(input);
    if (result.ok) return result.value;
    log(result.errors);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown validation exception";
    log([{ path: "$", message: `validator threw: ${message}` }]);
    return null;
  }
}
