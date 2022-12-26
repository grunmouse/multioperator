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
	constructor(name, description){
		this.name = name;
		this.description = description;
		this._first = Symbol(name + '[first]');
		this._second = Symbol(name + '[second]');
		this.key = this._first;
		this._alias = new Set()
		this._alias.add(this);
		this.owners = new Set();
	}
	
	valueOf(){
		return this.key;
	}
	
	static *itrFirst(First){
		if(First[firstSet]) for(let oper of First[firstSet]){
			let method = First.prototype[oper._first];
			for(let [Second, func] of method.mapping){
				yield [oper, First, Second, func];
			}
		}
	}
	
	static *itrSecond(Second){
		if(Second[secondSet]) for(let [oper, firsts] of Second[secondSet]){
			for(let First of firsts){
				let method = First.prototype[oper._first];
				let func = method.mapping.get(Second);
				yield [oper, First, Second, func];
			}
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
			if(!this[key]){
				throw new Error(`Method Symbol(${this.name}) is not created in ${First} prototype`);
			}
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
		
		//Вызов в качестве реализации существующего метода First по имени (символ или строка)
		if(typeof func === 'symbol' || typeof func === 'string'){
			func = caller(func);
		}
		
		let method;
		if(this.hasMethod(First)){
			method = First.prototype[this._first];
		}
		else{
			method = Multimethod(this._second, this);
			method[this._first] = First;
			First.prototype[this._first] = method;
			//a.prototype[_first][_first] === a
			
			//Заполняем owners
			this.owners.add(First);
			
			//Заполняем firstSet
			if(!First[firstSet]){
				First[firstSet] = new Set();
			}
			First[firstSet].add(this);
		}

		if(Second){
			Second.prototype[this._second] = Second;
			// a.prototype[_second] === a
			
			//Заполняем secondSet
			if(!Second[secondSet]){
				Second[secondSet] = new Map();
			}
			if(!Second[secondSet].has(this)){
				Second[secondSet].set(this, new Set());
			}
			Second[secondSet].get(this).add(First);
		}
		
		method.mapping.set(Second, func);
	}
	
	/**
	 * Клонирует все реализации переданного метода в текущий
	 */
	_defAs(mop){
		for(let First of mop.owners){
			let method = First.prototype[mop._first];
			for(let [Second, func] of method.mapping){
				this.def(First, Second, func);
			}
		}
	}
	
	/**
	 * Связывает два мультиопераора как псевдонимы друг друга
	 * добавляет во все мультиоператоры, считающиеся псевдонимами друг друга, 
	 * одно и то же общее множество псевдонимов
	 */
	addAsAlias(mop){
		let newAlias = new Set([...this._alias, ...mop._alias]);
		for(let op of newAlias){
			op._alias = newAlias;
		}
		
		this._defAs(mop);
		mop._defAs(this);
	}
	
	/**
	 * Итерирует алиасы, кроме текущего объекта
	 */
	*aliases(){
		for(let op of this._alias){
			if(op !== this){
				yield op;
			}
		}
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
				return method.mapping.get(null);
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