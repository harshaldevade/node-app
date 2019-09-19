

var array = [{ measureno: "123", numerator: 70, denominator: 110 },
{ measureno: "123", numerator: 100, denominator: 120}];


const wightedStrata = (array) => {
var numerators = array.map(measure => {measure.numerator })
var denominators = array.map(measure => {measure.denominator })

let sumOfNumerators = numerators.reduce((num, numerator) => num + numerator, 0);
let sumOfDenominators = denominators.reduce((num, denom) => num + denom, 0);

let wightedStrata = (sumOfNumerators / sumOfDenominators) * 100
console.log(wightedStrata)
return wightedStrata;
}



const simpleStrata = (array) => {
var result = array.map(measure => { return measure.numerator / measure.denominator * 100 })
const total =result.reduce((num, numerator) => num + numerator, 0);
let simpleStrata = total / array.length
return simpleStrata;

}


const specifiedStrata = (array) => {
var result = array.map(measure => { return measure.numerator / measure.denominator})
var specific_performance = 1 ;
var performance = result[specific_performance]
return performance;

}

