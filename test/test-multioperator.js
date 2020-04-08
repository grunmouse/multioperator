const Multioperator = require('../index.js');

const assert = require('assert').strict;

describe('Multioperator', ()=>{
	describe('Exists', ()=>{
		it('ok', ()=>{
			assert.ok(Multioperator);
		});
		it('implementation', ()=>{
			let add = new Multioperator('add');
			assert.equal(add.constructor, Multioperator);
		});
	});
	
	describe('def', ()=>{
		const add = new Multioperator('add');
		const ADD = add.key;
		const func = (a, b)=>(a+b)
		add.def(Number, Number, func);
		
		it('created method', ()=>{
			assert.ok((1)[ADD] instanceof Function);
		});
		
		it('getImplement', ()=>{
			let imp = add.getImplement(Number, Number);
			assert.equal(imp, func);
		});
		
		it('call', ()=>{
			assert.equal((1)[ADD](2), 3);
		});
		
		it('valueOf', ()=>{
			assert.equal((1)[add](2), 3);
		});
	});
	
	describe('def unar', ()=>{
		const neg = new Multioperator('neg');
		const NEG = neg.key;
		
		neg.def(Number, (a)=>(-a));
		
		it('call', ()=>{
			assert.equal((10)[NEG](), -10);
		});
	});
	
	describe('many implements', ()=>{
		const add = new Multioperator('add');
		const ADD = add.key;
		const normalAdd = (a, b)=>(a+b);
		const inconsistAdd = (num, big)=>{
			num = num.valueOf();
			if(Number.isInteger(num)){
				return BigInt(num) + big;
			}
			else{
				return num + Number(big);
			}
		}
		add.def(Number, Number, normalAdd);
		add.def(BigInt, BigInt, normalAdd);
		add.def(Number, BigInt, inconsistAdd);
		add.def(BigInt, Number, (a, b)=>inconsistAdd(b, a));
		
		it('call Number, Number', ()=>{
			assert.equal((10)[ADD](5), 15);
		});
		it('call BigInt, BigInt', ()=>{
			assert.equal((1024n)[ADD](128n), 1152n);
		});
		it('call Number(int), BigInt', ()=>{
			assert.equal((1000)[ADD](128n), 1128n);
		});
		it('call Number(float), BigInt', ()=>{
			assert.equal((1.5)[ADD](128n), 129.5);
		});
		it('call BigInt, Number(int)', ()=>{
			assert.equal((128n)[ADD](1000), 1128n);
		});
		it('call BigInt, Number(float)', ()=>{
			assert.equal((128n)[ADD](1.5), 129.5);
		});
	});
	
	describe('cross second', ()=>{
		const oper = new Multioperator('oper');
		
		function Class1(){
		}
		function Class2(){
		}
		function Class3(){
		}
		function Class4(){
		}
		class Class5 extends Class2{}
		
		oper.def(Class1, Class2, ()=>('1-2'));
		oper.def(Class3, Class4, ()=>('3-4'));
		
		it('own 1-3', ()=>{
			let method = oper.getOwnImplement(Class1, Class3);
			assert.ok(!method);
		});
		it('own 1-4', ()=>{
			let method = oper.getOwnImplement(Class1, Class4);
			assert.ok(!method);
		});
		it('own 1-5', ()=>{
			let method = oper.getOwnImplement(Class1, Class5);
			assert.ok(!method);
		});
		it('1-3', ()=>{
			let method = oper.getImplement(Class1, Class3);
			assert.ok(!method);
		});
		it('1-4', ()=>{
			let method = oper.getImplement(Class1, Class4);
			assert.ok(!method);
		});
		it('1-5', ()=>{
			let method = oper.getImplement(Class1, Class5);
			assert.ok(method);
		});
	});

});