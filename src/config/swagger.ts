import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';
import { JsonObject } from 'swagger-ui-express';

// Load the OpenAPI specification from YAML file
const openApiPath = join(__dirname, '../docs/openapi.yaml');
const openApiDocument = load(readFileSync(openApiPath, 'utf8')) as JsonObject;

// Export the loaded specification
export const swaggerSpec = openApiDocument; 