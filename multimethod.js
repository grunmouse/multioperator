
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
 * @property {Map<(Constructor|null).MethodImplementation>} mapping - карта реализации методов
 */

/**
 * Фабрика, создающая Multimethod
 * @param {Symbol} _second - ключ второго аргумента мультиметода
 * @return {Multimethod}
 */
function Multimethod(_second, MOP){
	const mapping = new Map();
	
	const method = function(second, ...param){
		let func;
		if(second == null){
			func = mapping.get(null);
		}
		else{
			let Second = second[_second];
			if(Second){
				func = mapping.get(Second);
			}
		}
		if(!func){
			let Second = second && (second[_second] || second.constructor);
			let second_name = Second ? Second.name : 'null';
			throw new TypeError('The argument can not be ' + second_name);
		}
		return func(this, second, ...param);
	}
	method.mapping = mapping;
	
	return method;
}

module.exports = Multimethod;