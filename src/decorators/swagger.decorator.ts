import 'reflect-metadata';

export function ApiEndpoint(docs: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store swagger docs in metadata
    Reflect.defineMetadata('swagger-docs', docs, target, propertyKey);
    return descriptor;
  };
} 