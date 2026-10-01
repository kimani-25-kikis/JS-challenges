let obj = {
    value: 1,
    increment: function() {
        this.value++;
        return this;
    },
    double: function() {
        this.value *= 2;
        return this;
    },
    getValue: function() {
        return this.value;
    }
};

let result = obj.increment().double().increment().getValue();
console.log(result);