# 6.3 Índices

Un **índice** es una estructura que el motor mantiene **junto a la tabla** para encontrar filas **sin leerlas todas**. Es como el **índice alfabético de un libro**: para buscar «Cádiz» no lees el libro entero, vas a la página que te indica el índice.

## Sin índice: leer toda la tabla

Con pocas filas no se nota, pero con millones, buscar una ciudad obligaría a leer **todas las filas**. El motor puede decirte **cómo va a ejecutar** una consulta con `EXPLAIN QUERY PLAN` (en otros motores, `EXPLAIN`):

```sql
EXPLAIN QUERY PLAN
SELECT nombre FROM alumnos WHERE ciudad = 'Cádiz';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 2 | 0 | 216 | SCAN alumnos |

*1 fila*

`SCAN alumnos` significa que **recorre la tabla entera** (todas las filas).

## Crear un índice

```sql
CREATE INDEX idx_alumnos_ciudad ON alumnos (ciudad);
EXPLAIN QUERY PLAN
SELECT nombre FROM alumnos WHERE ciudad = 'Cádiz';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 62 | SEARCH alumnos USING INDEX idx_alumnos_ciudad (ciudad=?) |

*1 fila*

Ahora el plan dice `SEARCH ... USING INDEX`: **va directamente** a las filas de Cádiz. El resultado de la consulta es el mismo, pero el motor trabaja mucho menos. (El texto del plan cambia entre motores y versiones.)

## Qué índices existen sin que los crees

El motor crea **automáticamente** un índice para cada **clave primaria** y para cada columna **`UNIQUE`**. Por eso buscar por `id` ya es rápido. En cambio, **las claves foráneas normalmente no se indexan solas** (en MySQL sí), y son las columnas que más se usan en los `JOIN`, así que suele convenir indexarlas.

## Cuándo crear un índice

| Conviene | No conviene |
|---|---|
| Columnas que se usan mucho en `WHERE` | Tablas **pequeñas**: leerlas enteras es igual de rápido |
| Columnas de los `JOIN` (claves foráneas) | Columnas que **casi nunca** se consultan |
| Columnas de `ORDER BY` sobre muchas filas | Columnas con **muy pocos valores distintos** (un `sexo`, un `activo`) |
| Columnas con **muchos valores distintos** | Tablas que se **modifican constantemente**: cada índice hay que actualizarlo |

**El coste:** los índices **ocupan espacio** y **ralentizan** los `INSERT`, `UPDATE` y `DELETE`, porque hay que mantenerlos al día. No se crean «por si acaso»: se crean cuando una consulta importante es lenta.

## Índices sobre varias columnas

Un índice puede cubrir **varias columnas**. **El orden importa**: un índice sobre `(ciudad, apellido)` sirve para buscar por `ciudad`, o por `ciudad` **y** `apellido`, pero **no** para buscar solo por `apellido`.

```sql
CREATE INDEX idx_ciudad_apellido ON alumnos (ciudad, apellido);
EXPLAIN QUERY PLAN
SELECT nombre FROM alumnos WHERE ciudad = 'Cádiz' AND apellido = 'Gil';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 61 | SEARCH alumnos USING INDEX idx_ciudad_apellido (ciudad=? AND apellido=?) |

*1 fila*

## Índices únicos

`CREATE UNIQUE INDEX` crea un índice que además **impide valores repetidos**: es lo que está detrás de una restricción `UNIQUE`.

## Cuándo el índice NO se usa

Aunque exista, el motor **no puede usar el índice** si la búsqueda lo impide:

| Consulta | Por qué no |
|---|---|
| `WHERE UPPER(ciudad) = 'CÁDIZ'` | Se aplica una **función** a la columna: el índice está ordenado por el valor original |
| `WHERE apellido LIKE '%il'` | Empieza por un comodín: no se puede ir a una zona concreta (`LIKE 'Gi%'` sí) |
| `WHERE id + 1 = 5` | Se calcula con la columna |
| Una columna con tipo distinto al valor | Puede obligar a convertir cada fila |

## Borrar un índice

`DROP INDEX idx_alumnos_ciudad;` lo elimina; los datos de la tabla no se tocan.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Indexar todas las columnas | Solo las que lo necesiten, según las consultas reales |
| Un índice que nunca se usa | Compruébalo con `EXPLAIN` |
| Poner mal el orden de las columnas en un índice compuesto | Primero la más usada en la búsqueda |
| Aplicar funciones a la columna en el `WHERE` | Dejar la columna «limpia» y transformar el valor que se busca |

## Para practicar

El ejercicio S6.6 de [S6 · Ejercicios](ejercicios.md) practica los índices.
