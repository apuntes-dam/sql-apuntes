# 6.4 Transacciones

Una **transacción** agrupa varias sentencias para que se ejecuten **como una sola operación**: o se hacen **todas**, o no se hace **ninguna**.

## Por qué hacen falta

Imagina cambiar a un alumno de grupo y actualizar a la vez un contador. Si el programa se cae **entre las dos sentencias**, la base de datos queda **a medias**: incoherente. Con una transacción, o se aplican las dos o ninguna.

## BEGIN, COMMIT y ROLLBACK

| Sentencia | Qué hace |
|---|---|
| `BEGIN` (o `START TRANSACTION`) | **Empieza** la transacción |
| `COMMIT` | **Confirma**: los cambios se guardan definitivamente |
| `ROLLBACK` | **Deshace** todo lo hecho desde el `BEGIN` |

Se ve mejor con una prueba arriesgada: dentro de una transacción se **borran** las notas de la segunda convocatoria, se comprueba, y se **deshace**:

```sql
BEGIN;
DELETE FROM notas WHERE convocatoria = 2;
SELECT COUNT(*) AS notas_dentro_de_la_transaccion FROM notas;
```

Resultado:

| notas_dentro_de_la_transaccion |
|---|
| 46 |

*1 fila*

Dentro de la transacción faltan notas. Pero si ahora se hace `ROLLBACK`:

```sql
BEGIN;
DELETE FROM notas WHERE convocatoria = 2;
ROLLBACK;
SELECT COUNT(*) AS notas_despues_del_rollback FROM notas;
```

Resultado:

| notas_despues_del_rollback |
|---|
| 57 |

*1 fila*

**Las 57 notas siguen ahí**: el `ROLLBACK` lo ha deshecho todo. Con `COMMIT` en lugar de `ROLLBACK`, los borrados habrían quedado confirmados.

!!! tip "Una red de seguridad"
    Antes de un `UPDATE` o `DELETE` importante: `BEGIN;`, ejecutarlo, **comprobar el resultado**, y solo entonces `COMMIT;` (o `ROLLBACK;` si algo no cuadra). Así es difícil romper algo sin querer.

## Autocommit

Por defecto, la mayoría de los motores funcionan en **autocommit**: **cada sentencia es una transacción en sí misma**, que se confirma sola. Solo agrupas varias sentencias cuando escribes `BEGIN` (o desactivas el autocommit desde un programa, como se vio en la unidad de bases de datos de los [lenguajes](https://apuntes-dam.github.io/apuntes-lenguajes/)).

## SAVEPOINT: deshacer solo una parte

Un **punto de guardado** permite deshacer **solo lo posterior** sin cancelar toda la transacción:

```sql
BEGIN;
UPDATE notas SET nota = 0 WHERE id_alumno = 1;
SAVEPOINT antes_del_borrado;
DELETE FROM notas WHERE id_alumno = 2;
ROLLBACK TO antes_del_borrado;
COMMIT;
SELECT (SELECT COUNT(*) FROM notas WHERE id_alumno = 2) AS notas_del_alumno_2,
       (SELECT MAX(nota) FROM notas WHERE id_alumno = 1) AS maxima_del_alumno_1;
```

Resultado:

| notas_del_alumno_2 | maxima_del_alumno_1 |
|---|---|
| 4 | 0.0 |

*1 fila*

Se mantuvo el `UPDATE` (las notas del alumno 1 valen 0), pero se **deshizo el borrado** (el alumno 2 conserva sus 4 notas).

## Las propiedades ACID

Un motor serio garantiza que las transacciones cumplen cuatro propiedades:

| Propiedad | Significa |
|---|---|
| **A**tomicidad | Todo o nada |
| **C**onsistencia | Los datos siguen cumpliendo las reglas (claves, `CHECK`...) antes y después |
| **I**slamiento | Las transacciones simultáneas **no se estorban**: cada una ve los datos como si estuviera sola |
| **D**urabilidad | Lo confirmado **no se pierde**, aunque el equipo se apague |

## Aislamiento y concurrencia

Cuando **varias personas** usan la base de datos a la vez, el motor aísla sus transacciones. Cuánto las aísla se configura con los **niveles de aislamiento**: más aislamiento significa más seguridad pero menos velocidad.

| Problema que puede ocurrir | Qué es |
|---|---|
| **Lectura sucia** | Ver datos de otra transacción que **todavía no se ha confirmado** (y quizá se deshaga) |
| **Lectura no repetible** | Leer dos veces la misma fila y obtener **valores distintos**, porque otra transacción la cambió entre medias |
| **Lectura fantasma** | Repetir una consulta y que aparezcan **filas nuevas** que otra transacción insertó |

| Nivel | Evita |
|---|---|
| `READ UNCOMMITTED` | Nada (permite lecturas sucias) |
| `READ COMMITTED` | Lecturas sucias |
| `REPEATABLE READ` | Lecturas sucias y no repetibles |
| `SERIALIZABLE` | Todos los problemas |

El nivel **por defecto** depende del motor: `READ COMMITTED` en PostgreSQL y Oracle, `REPEATABLE READ` en MySQL (InnoDB), y SQLite trabaja de forma serializable (una sola escritura a la vez).

Para proteger los datos mientras se modifican, los motores usan **bloqueos**: una transacción puede tener que **esperar** a otra. Si dos transacciones se esperan **mutuamente**, hay un **interbloqueo** (*deadlock*): el motor detecta la situación y **cancela una de las dos**, y el programa debe estar preparado para reintentarla.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Hacer varios cambios relacionados sin transacción | Agruparlos con `BEGIN` ... `COMMIT` |
| Olvidar el `COMMIT` y dejar la transacción abierta | Siempre `COMMIT` o `ROLLBACK`: una transacción abierta puede **bloquear** a los demás |
| Transacciones largas | Cuanto más corta, menos bloquea |
| No gestionar el error y no hacer `ROLLBACK` | En un programa, `try/catch` con `rollback` |
| Asumir que un motor aísla como otro | Consulta el nivel por defecto del tuyo |

## Para practicar

El ejercicio S6.7 de [S6 · Ejercicios](ejercicios.md) practica las transacciones.
