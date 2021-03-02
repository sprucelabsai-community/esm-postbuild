import SpruceError from '../errors/SpruceError';
import log from '../singletons/log';
export default class AbstractField {
    constructor(name, definition) {
        this.definition = definition;
        this.name = name;
        this.type = definition.type;
        return this;
    }
    static get description() {
        throw new SpruceError({
            code: 'NOT_IMPLEMENTED',
            instructions: `Copy and paste this into ${this.name}:

public static get description() {
	return '*** describe your field here ***'
}

`,
        });
    }
    /** For mapping schemas to types dynamically in schema values */
    static generateTypeDetails() {
        return {
            valueTypeMapper: undefined,
        };
    }
    /** Details needed for generating templates */
    static generateTemplateDetails(options) {
        log.info(options);
        throw new SpruceError({
            code: 'NOT_IMPLEMENTED',
            instructions: `Copy and paste this into ${this.name}:
			
public static generateTemplateDetails(
	options: IFieldTemplateDetailOptions<I{{YourFieldName}}Definition>
): IFieldTemplateDetails {
	const { definition } = options
	return {
		valueType: \`string\${definition.isArray ? '[]' : ''}\`
	}
}`,
        });
    }
    get options() {
        return this.definition.options;
    }
    get isRequired() {
        return !!this.definition.isRequired;
    }
    get isPrivate() {
        return !!this.definition.isPrivate;
    }
    get isArray() {
        return !!this.definition.isArray;
    }
    get label() {
        return this.definition.label;
    }
    get hint() {
        return this.definition.hint;
    }
    validate(value, _) {
        var _a;
        const errors = [];
        if ((typeof value === 'undefined' || value === null) && this.isRequired) {
            errors.push({
                code: 'missing_required',
                friendlyMessage: `'${(_a = this.label) !== null && _a !== void 0 ? _a : this.name}' is required!`,
                name: this.name,
            });
        }
        return errors;
    }
    /** Transform any value to the value type of this field */
    toValueType(value, _) {
        return value;
    }
}
/** A field that comprises a schema */
//# sourceMappingURL=AbstractField.js.map