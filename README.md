# @grunmouse/multioperator


\@exports class Multioperator

## Назначение
Предназначен для создания и добавления в прототипы перегружаемых унарных методов.

Может пригодиться при создании собственных библиотек.


## Принцип действия


У каждого экземпляра Multioperator есть уникальный ключ (Symbol). Этот ключ используется в качестве имени метода, добавляемого в прототипы поддерживаемых классов.

Экземпляр класса Multioperator содержит открытые свойства
- {String} name - имя операции, передаётся в аргументе конструктора
- {Symbol} key - уникальный символ, создаётся в конструкторе

Метод def экземпляра создаёт реализацию метода.

- @method def(First, \[Second], Implementation)

First и Second - конструкторы, по которым будут опознаваться аргументы\
Implementation - функция, принимающая один или два аргумента, причём, ожидающая, что первый аргумент будет экземпляром First, а второй - null или экземпляром Second.

В прототипе First будет создан метод с именем \[key]. Этот метод будет принимать один аргумент, проверять его тип, и запускать соответствующую функцию Implementation


## sample

```

//@const {Constructor} MOP
const MOP = require('@grunmouse/mutioperator'); //импорт пакета, MOP - конструктор

//@const {MOP} mul
const mul = new MOP('mul'); //Создаём объект, управляющий созданием методов

//@const {Symbol} MUL
const MUL = oper.key; //Получаем уникальный ключ операции, этот ключ будет служить именем метода

//Пусть у меня есть вектора и матрицы
const Vector = require('./vector.js'), Matrix = require('./matrix.js'); //Условные классы


/* 
	Здесь в прототип Vector добавляется метод под именем [MUL], 
	Этот метод, принимает один аргумент.
	В случае если аргумент - экземпляр Vector или его наследника, 
	то будет вызвана переданная функция, с двумя аргументами, где первый - это контекст метода, а второй - аргумент метода.
	Метод вернёт то, что возвратит эта функция
*/
mul.def(Vector, Vector, (a, b)=>(/* произведение векторов */));
/*
	Здесь аналогичный метод добавляется в прототип Matrix
*/
mul.def(Matrix, Matrix, (a, b)=>(/* произведение матриц */));
/*
	Здесь в ранее добавленный метод добавляется вторая реализация, которая будет найдена и вызвана,
	если вторым аргументом будет экземпляр Vector или его наследника
*/
mul.def(Matrix, Vector, (a, b)=>(/* произведение матрицы на вектор */));

let m1 = new Matrix(), v1 = new Vector();
//Я могу и так
let sqv = v1[MUL](v1);
//и так
let sqm = m1[MUL](m1);
//и так
let transform = m1[MUL](v1);

```
