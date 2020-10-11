
const WeakMapWithNull = require('./weak-map-with-null.js');

/**
 * @typedef {Function<(F, ?S)=>(any)>} MethodImplementation<F, S>
 * @typeparam F - конструктор первого аргумента
 * @typeparam S - конструктор второго аргумента или null (для унарной функции)
 * @param {F} first - первый аргумент функции
 * @param {?S} second - второй аргумент функции или null (для унарной функции)
 * @return {any}
 */

/**
 * Представляет мультиметод, принимающий один аргумент (возможно null-ный)
 * @typedef {Function<(?any)=>(any)>} Multimethod
 * @param {?any} - второй аргумент оператора, по конструктору которого будет выбрана реализация метода
 * @return {any} - результат выполнения метода
 * @property {WeakMapWithNull<(Constructor|null).MethodImplementation>} mapping - карта реализации методов
 */

/**
 * Фабрика, создающая Multimethod
 * @param {Symbol} _second - ключ второго аргумента мультиметода
 * @return {Multimethod}
 */
function Multimethod(_second){
	const mapping = new Map();
	
	const method = function(second, ...param){
		if(second == null){
			let func = mapping.get(null);
			if(!func){
				throw new TypeError('The argument can not be null');
			}
			return func(this, null, ...param);
		}
		else{
			let Second = second[_second];
			let func = mapping.get(Second);
			if(!func){
				throw new TypeError('The argument can not be ' + Second.name);
			}
			return func(this, second, ...param);
		}
	}
	method.mapping = mapping;
	
	return method;
}

module.exports = Multimethod;