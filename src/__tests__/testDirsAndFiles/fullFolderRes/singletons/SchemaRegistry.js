import flatten from 'lodash/flatten.js';
import SpruceError from '../errors/SpruceError.js';
import validateSchema from '../utilities/validateSchema.js';
export default class SchemaRegistry {
    constructor() {
        this.schemasById = {};
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SchemaRegistry();
        }
        return this.instance;
    }
    trackSchema(schema) {
        validateSchema(schema);
        const id = schema.id;
        if (!this.schemasById[id]) {
            this.schemasById[id] = [];
        }
        if (this.isTrackingSchema(schema.id, schema.version, schema.namespace)) {
            throw new SpruceError({
                code: 'DUPLICATE_SCHEMA',
                schemaId: schema.id,
                version: schema.version,
                namespace: schema.namespace,
            });
        }
        this.schemasById[id].push(schema);
    }
    isTrackingSchema(id, version, namespace) {
        try {
            this.getSchema(id, version, namespace);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    getAllSchemas() {
        return flatten(Object.values(this.schemasById));
    }
    getTrackingCount() {
        let count = 0;
        Object.keys(this.schemasById).forEach((key) => {
            count += this.schemasById[key].length;
        });
        return count;
    }
    forgetAllSchemas() {
        this.schemasById = {};
    }
    getSchema(id, version, namespace) {
        if (!this.schemasById[id]) {
            throw new SpruceError({
                code: 'SCHEMA_NOT_FOUND',
                schemaId: id,
                namespace,
                version,
            });
        }
        const namespaceMatches = namespace
            ? this.schemasById[id].filter((d) => d.namespace === namespace)
            : this.schemasById[id];
        const versionMatch = namespaceMatches.find((d) => d.version === version);
        if (!versionMatch) {
            throw new SpruceError({
                code: 'VERSION_NOT_FOUND',
                schemaId: id,
                namespace,
            });
        }
        return versionMatch;
    }
    forgetSchema(id, version) {
        var _a, _b;
        this.schemasById[id] = (_a = this.schemasById[id]) === null || _a === void 0 ? void 0 : _a.filter((schema) => !(schema.id === id && schema.version === version));
        if (((_b = this.schemasById[id]) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            delete this.schemasById[id];
        }
    }
}
//# sourceMappingURL=SchemaRegistry.js.map