document.addEventListener('DOMContentLoaded', function() {
    Validator('#form-1',{
        onSubmit:function(){
            console.log("call api")
        }
    });
});

function Validator(formSelector,options={}) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var formRules = {};
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        },
        min: function(value) {
            return function(value) {
                value.length >= 6 ? undefined : 'Vui lòng nhập tối thiểu ${value} kí tự';
            }

        }
    }
    var formElement = document.querySelector(formSelector);
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0];
                }
                var ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            //listening event for validator
            input.onblur = handleValidator;
            input.oninput = handleClearErr;

            console.log(formRules);
        }

        function handleValidator(event) {
            var rules = formRules[event.target.name];
            var errorsMessage
            rules.find(function(rule) {
                errorsMessage = rule(event.target.value);
                return errorsMessage
            });
            if (errorsMessage) {
                var fromGroup = getParent(event.target, '.form-group');
                if (fromGroup) {
                    var formMessage = fromGroup.querySelector('.form-message');
                    if (formMessage) {
                        fromGroup.classList.add('invalid');
                        formMessage.innerText = errorsMessage;
                    }
                }
                
            }
        }

        function handleClearErr(event){
            var fromGroup = getParent(event.target, '.form-group');
            if(fromGroup.classList.contains('invalid')){
                fromGroup.classList.remove('invalid');
                var formMessage = fromGroup.querySelector('.form-message');
                if(formMessage){
                    formMessage.innerText =''; 
                }

            }
         }
    }
     // xu ly hanh vi submigt
     formElement.onsubmit= function(event){
        event.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid=true;
        for (var input of inputs) {
           if(!handleValidator({target:input})) {
            isValid=false
           }
        }
        if(isValid){
            if(typeof options.onSubmit=='function') {
                var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                options.onSubmit()
            }else{
                formElement.submit();
            }
        }
     }
}
