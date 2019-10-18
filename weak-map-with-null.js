/**
 * @class WeakMapWithNull
 * @extends WeakMap
 * Мапа со слабыми ссылками, с добавленной возможностью использовать null-ный ключ
 */

class WeakMapWithNull extends WeakMap{
	
	delete(key){
		if(key == null){
			if(this._fornull !== undefined){
				this._fornull = undefined;
				return true;
			}
			else{
				return false;
			}
		}
		else{
			return super.delete(key);
		}
	}
	
	get(key){
		if(key == null){
			return this._fornull;
		}
		else{
			return super.get(key);
		}
	}
	
	has(key){
		if(key == null){
			return this._fornull !== undefined;
		}
		else{
			return super.has(key);
		}
	}
	
	set(key, value){
		if(key == null){
			this._fornull = value;
			return this;
		}
		else{
			return super.set(key, value);
		}
	}
	
}

module.exports = WeakMapWithNull;