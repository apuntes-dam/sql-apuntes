# 1.2 SELECT: pedir datos

`SELECT` es la sentencia que **lee** datos. Su forma más sencilla es:

```sql
SELECT columnas FROM tabla;
```

## Todas las columnas

El asterisco (`*`) significa «todas las columnas»:

```sql
SELECT * FROM profesores;
```

Resultado:

| id | nombre |
|---|---|
| 1 | Marta Ruiz |
| 2 | Pedro Salas |
| 3 | Lucía Ferrer |
| 4 | Hugo Navas |

*4 filas*

Es cómodo para **explorar**, pero en programas reales conviene escribir las columnas que hacen falta: el resultado es más pequeño, más claro y no cambia si alguien añade columnas a la tabla.

## Algunas columnas

Se escriben separadas por comas, en el orden en que quieres verlas:

```sql
SELECT apellido, nombre, ciudad FROM alumnos;
```

Resultado:

| apellido | nombre | ciudad |
|---|---|---|
| Gil | Ana | Cádiz |
| Romero | Luis | Sevilla |
| Díaz | Marta | Cádiz |
| Núñez | Pablo | Jerez |
| Vega | Sara | Sevilla |
| … | … | … |

*14 filas* (se muestran 5)

## Alias: darle otro nombre a una columna

Con `AS` se cambia el **nombre que se muestra** (no el de la tabla). Es muy útil con cálculos:

```sql
SELECT nombre AS asignatura, horas, horas / 30 AS semanas_aprox FROM asignaturas;
```

Resultado:

| asignatura | horas | semanas_aprox |
|---|---|---|
| Programación | 230 | 7 |
| Bases de Datos | 160 | 5 |
| Entornos de Desarrollo | 100 | 3 |
| Lenguajes de Marcas | 100 | 3 |
| Sistemas Informáticos | 160 | 5 |
| Inglés Técnico | 60 | 2 |

*6 filas*

Los **cálculos** (`+`, `-`, `*`, `/`, `%`) pueden hacerse con las columnas numéricas. Fíjate en que `230 / 30` da `7`: dividir **dos enteros** da un entero en SQLite (y en PostgreSQL, pero **no** en MySQL, que devuelve decimales).

## Texto literal y concatenación

Puedes escribir **valores fijos** en el `SELECT`, y unir textos con `||`:

```sql
SELECT nombre || ' ' || apellido AS nombre_completo, ciudad FROM alumnos;
```

Resultado:

| nombre_completo | ciudad |
|---|---|
| Ana Gil | Cádiz |
| Luis Romero | Sevilla |
| Marta Díaz | Cádiz |
| Pablo Núñez | Jerez |
| Sara Vega | Sevilla |
| … | … |

*14 filas* (se muestran 5)

!!! info "Concatenar texto según el motor"
    `||` es el estándar y funciona en SQLite, PostgreSQL y Oracle. **MySQL** usa la función `CONCAT(nombre, ' ', apellido)` (y trata `||` como «O» lógico, salvo que se configure).

## DISTINCT: quitar repetidos

Una consulta puede devolver **filas repetidas**. `DISTINCT` deja solo una de cada:

```sql
SELECT ciudad FROM alumnos;
```

Resultado:

| ciudad |
|---|
| Cádiz |
| Sevilla |
| Cádiz |
| Jerez |
| Sevilla |
| Cádiz |
| … |

*14 filas* (se muestran 6)

```sql
SELECT DISTINCT ciudad FROM alumnos;
```

Resultado:

| ciudad |
|---|
| Cádiz |
| Sevilla |
| Jerez |
| Málaga |

*4 filas*

## LIMIT: pocas filas

Para ver solo las primeras filas:

```sql
SELECT nombre, apellido FROM alumnos LIMIT 3;
```

Resultado:

| nombre | apellido |
|---|---|
| Ana | Gil |
| Luis | Romero |
| Marta | Díaz |

*3 filas*

!!! info "LIMIT según el motor"
    `LIMIT n` funciona en SQLite, MySQL y PostgreSQL. En **SQL Server** se escribe `SELECT TOP 3 ...` y en **Oracle** `FETCH FIRST 3 ROWS ONLY` (o `ROWNUM <= 3` en versiones antiguas).

## Cómo piensa SQL

Aunque escribes `SELECT` primero, el gestor **trabaja en otro orden**: primero decide **de qué tabla** (`FROM`), luego **qué filas** (`WHERE`), y al final **qué columnas** enseñar (`SELECT`). Es una idea que ayuda mucho cuando las consultas se complican.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Olvidar el `;` al final | Cada sentencia termina en `;` |
| Usar `SELECT *` en todas partes | Escribir las columnas que se necesitan |
| Comillas dobles para el texto (`"Cádiz"`) | Comillas **simples**: `'Cádiz'` |
| Escribir mal un nombre de columna | Consulta antes la tabla con `SELECT * FROM tabla LIMIT 3;` |
| Esperar que `/` dé decimales con enteros | Convertir uno a decimal: `horas / 30.0` |

## Para practicar

Los primeros ejercicios de [S1 · Ejercicios](ejercicios.md) usan solo `SELECT`, `DISTINCT` y `LIMIT`.
