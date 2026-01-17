# Shared Validation Package

Centralized validation schemas and configuration for property listing across frontend and backend.

## Structure

```
shared-validation/
├── schemas/              # Zod validation schemas
│   ├── basicDetailsSchema.js
│   ├── locationSelectionSchema.js
│   └── ...
├── config/              # Step configuration
│   └── stepConfiguration.js
├── index.js            # Main exports
└── package.json
```

## Usage

### Backend (Node.js)
```javascript
const { schemas, stepConfig } = require('@feedaq/shared-validation');

// Validate data
const result = schemas.basicDetailsSchema.safeParse(data);

// Get steps for property type
const steps = stepConfig.getVisibleSteps({ propertyType: 'apartment' });
```

### Frontend (React/Vite)
```javascript
import { schemas, stepConfig } from '@feedaq/shared-validation';
```

## Installation in Projects

Add to `package.json` in both frontend and backend:

```json
{
  "dependencies": {
    "@feedaq/shared-validation": "file:../shared-validation"
  }
}
```

Then run `npm install` or `pnpm install`.
