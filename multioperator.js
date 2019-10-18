const Multimethod = require('./multimethod.js');

/**
 * Представляет бинарную мультифункцию, возможно с null во втором операнде
 * @class Multioperator
 * @property {String} name - имя оператора (используется для отладки и может быть использовано для создания методов)
 * @property {Symbol} key - ключ оператора (используется для идентификации оператора и создания методов)
 */
class Multioperator{
	constructor(name){
		this.name = name;
		this._first = Symbol(name + '[first]');
		this._second = Symbol(name + '[second]');
		this.key = this._first;
	}
	

	/**
	 * Проверяет наличие у прототипа First соответствующего мультиметода
	 * @param {Constructor} First
	 * @return {Boolean}
	 */
	hasMethod(First){
		return First.prototype.hasOwnProperty(this._first);
	}
	
	/**
	 * Добавляет в прототип First метод под принятым именем.
	 * Не рекомендуется применять к всторенным объектам
	 * @param {Constructor} First
	 * @void
	 */
	useName(First){
		let proto = First.prototype;
		proto[this.name] = proto[this._first];
	}
	
	/**
	 * Регистрирует реализацию мультиметода
	 * @param {Constructor} First - конструктор первого аргумента
	 * @param {?Constructor} Second - конструктор второго аргумента
	 * @param {MethodImplementation<First, Second>} func - выполняемая для них функция
	 * @void
	 */
	def(First, Second, func){
		if(!func){
			func = Second;
			Second = null;
		}
		
		let method;
		if(this.hasMethod(First)){
			method = First.prototype[this._first];
		}
		else{
			method = Multimethod(this._second);
			method[this._first] = First;
			First.prototype[this._first] = method;
			//a.prototype[_first][_first] === a
		}

		if(Second){
			Second.prototype[this._second] = Second;
			// a.prototype[_second] === a
		}
		
		method.mapping.set(Second, func);
	}
	
	/**
	 * Получить реализацию метода для переданных типов
	 * @param {Constructor} First - конструктор первого аргумента
	 * @param {?Constructor} Second - конструктор второго аргумента
	 * @return {?MethodImplementation<First, Second>}
	 */
	getImplement(First, Second){
		let method = First.prototype[this._first];
		if(method){
			return method.mapping.get(Second);
		}
	}
	
	/**
	 * Получить реализацию метода, точно соответствующую переданным типам
	 * @param {Constructor} First - конструктор первого аргумента
	 * @param {?Constructor} Second - конструктор второго аргумента
	 * @return {?MethodImplementation<First, Second>}
	 */
	getOwnImplement(First, Second){
		if(this.hasMethod(First)){
			let method = First.prototype[this._first];
			if(Second){
				if(Second.prototype.hasOwnProperty(this._second)){
					return metnod.mapping.get(Second);
				}
			}
			else{
				return method.mapping(null);
			}
		}
	}
}

module.exports = Multioperator;