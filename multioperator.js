const Multimethod = require('./multimethod.js');

const caller = (symbol)=>(a, b)=>(a[symbol](b));

const firstSet = Symbol('first-set');
const secondSet = Symbol('second-set');

const {MapOfSet} = require('@grunmouse/special-map');

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
	
	valueOf(){
		return this.key;
	}
	
	static *itrFirst(First){
		if(First[firstSet]) for(let oper of First[firstSet]){
			let method = First[oper._first];
			for(let [Second, func] of method.mapping){
				yield [oper, First, Second, func];
			}
		}
	}
	
	static *itrSecond(Second){
		if(Second[secondSet]) for(let [oper, First] of Second[secondSet]){
			let method = First[oper._first];
			let func = method.mapping.get(Second);
			yield [oper, First, Second, func];
		}
	}
	
	/**
	 * Ссылку на экземпляр можно использовать вместо ключа при вызове метода
	 */
	toString(){
		return this.key;
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
		const proto = First.prototype;
		const key = this.key;
		proto[this.name] = function(b){
			return this[key](b);
		};
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
		
		if(typeof func === 'symbol'){
			func = caller(func);
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
			
			if(!First[firstSet]){
				First[firstSet] = new Set();
			}
			First[firstSet].add(this);
		}

		if(Second){
			Second.prototype[this._second] = Second;
			// a.prototype[_second] === a
			if(!Second[secondSet]){
				Second[secondSet] = new MapOfSet();
			}
			Second[secondSet].add(this, First);
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
			Second = Second.prototype[this._second];
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
					return method.mapping.get(Second);
				}
			}
			else{
				return method.mapping(null);
			}
		}
	}
	
	/**
	 * Вызвать метод в контексте first с аргументом second
	 * @param {any} first
	 * @param {any} second
	 */
	call(first, second){
		return (first)[this.key](second);
	}
	
	get caller(){
		return caller(this.key);
	}
}

module.exports = Multioperator;