// THIS IS CAOLAN FORMS IMPORTED WITH THE bootstrapField code and EXPORTED
const forms = require('forms');
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets


const bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};


const createProductForm = (categories = [], tags = []) => {
    // forms.create takes in one argument
    // it is an object that defines the form
    // the key will be the `name` of each form field
    // and the value will be an object that define the field's properties
    return forms.create({
        name: fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        cost: fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.integer(), validators.min(0)]
        }),
        description: fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        category_id: fields.string({
            label: 'Category',
            require: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: categories
        }),
        tags: fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        }),
        "image_url": fields.string({
            widget: widgets.hidden()
        })
    })
}

const createRegistrationForm = () => {
    return forms.create({
        username: fields.string({
            required: true,
            errorAfterField: true
        }),
        email: fields.email({
            required: true,
            errorAfterField: true
        }),
        password: fields.password({
            required: true,
            errorAfterField: true,
        }),
        confirm_password: fields.password({
            required: true,
            errorAfterField: true,
            validators: [validators.matchField('password')]
        })

    })
}


const createLoginForm = () => {
    return forms.create({
        email: fields.email({
            required: true,
            errorAfterField: true
        }),
        password: fields.password({
            required: true,
            errorAfterField: true,
        })
    })
}

const createSearchForm = (categories = [], tags = []) => {
    return forms.create({
        "name": fields.string({
            required: false,
            errorAfterField: true
        }),
        "min_cost": fields.string({
            required: false,
            errorAfterField: true,
            validators: [validators.integer()]
        }),
        "max_cost": fields.string({
            required: false,
            errorAfterField: true,
            validators: [validators.integer()]
        }),
        "category_id": fields.string({
            label: 'Category',
            require: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: categories
        }),
        "tags": fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        })

    })
}

module.exports = { createProductForm, bootstrapField, createRegistrationForm, createLoginForm, createSearchForm }