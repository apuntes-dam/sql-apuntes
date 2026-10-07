# 5.3 Subconsultas

Una **subconsulta** es un `SELECT` **dentro de otra consulta**, entre paréntesis. Permite resolver preguntas que se contestan **en dos pasos**: «las notas **por encima de la media**» exige calcular antes la media.

## Subconsulta que devuelve un solo valor

Si la subconsulta devuelve **un único valor**, se puede usar donde iría un número:

```sql
SELECT id_alumno, id_asignatura, nota
FROM notas
WHERE convocatoria = 1
  AND nota > (SELECT AVG(nota) FROM notas WHERE convocatoria = 1)
ORDER BY nota DESC;
```

Resultado:

| id_alumno | id_asignatura | nota |
|---|---|---|
| 6 | 3 | 10.0 |
| 5 | 4 | 9.5 |
| 6 | 1 | 9.5 |
| 12 | 5 | 9.5 |
| 1 | 3 | 9.0 |
| 8 | 2 | 9.0 |
| … | … | … |

*26 filas* (se muestran 6)

Primero se calcula la media (un valor) y después se comparan todas las notas con él.

## Subconsulta que devuelve una lista: IN

Si devuelve **una columna con varios valores**, se combina con **`IN`**. Aquí, los alumnos que **han suspendido alguna vez**:

```sql
SELECT nombre, apellido
FROM alumnos
WHERE id IN (SELECT id_alumno FROM notas WHERE nota < 5)
ORDER BY apellido;
```

Resultado:

| nombre | apellido |
|---|---|
| Ana | Gil |
| Elena | Marín |
| Pablo | Núñez |
| Marcos | Peña |
| Noa | Prieto |
| Álex | Roca |
| Dani | Soto |
| Sara | Vega |

*8 filas*

## EXISTS: ¿hay alguna fila?

`EXISTS (subconsulta)` es verdadero si la subconsulta **devuelve al menos una fila**. Normalmente la subconsulta se refiere a la fila de la consulta exterior (es **correlacionada**):

```sql
SELECT a.nombre, a.apellido
FROM alumnos a
WHERE EXISTS (SELECT 1 FROM notas n WHERE n.id_alumno = a.id AND n.nota < 5)
ORDER BY a.apellido;
```

Resultado:

| nombre | apellido |
|---|---|
| Ana | Gil |
| Elena | Marín |
| Pablo | Núñez |
| Marcos | Peña |
| Noa | Prieto |
| Álex | Roca |
| Dani | Soto |
| Sara | Vega |

*8 filas*

Da el mismo resultado que el `IN` anterior. Para **cada alumno**, la subconsulta busca si tiene alguna nota menor de 5. (El `SELECT 1` es una costumbre: no importa qué columnas devuelva, solo si hay filas.)

Y `NOT EXISTS` encuentra **lo que no tiene**: los alumnos que tienen notas pero **ninguna suspensa**:

```sql
SELECT a.nombre, a.apellido
FROM alumnos a
WHERE EXISTS (SELECT 1 FROM notas n WHERE n.id_alumno = a.id)
  AND NOT EXISTS (SELECT 1 FROM notas n WHERE n.id_alumno = a.id AND n.nota < 5)
ORDER BY a.apellido;
```

Resultado:

| nombre | apellido |
|---|---|
| Raúl | Campos |
| Marta | Díaz |
| Lola | Ortiz |
| Luis | Romero |
| Iván | Torres |

*5 filas*

## La trampa de NOT IN con NULL

`NOT IN` tiene un comportamiento que sorprende: **si la lista contiene un `NULL`, no devuelve nada**. Se ve con un ejemplo. Se da de alta una profesora que **no imparte ninguna asignatura**, y se buscan los profesores sin asignaturas. En la lista de `id_profesor` de las asignaturas hay un `NULL` (la de inglés, sin profesor):

```sql
INSERT INTO profesores VALUES (5, 'Nuria Paz');
SELECT nombre FROM profesores
WHERE id NOT IN (SELECT id_profesor FROM asignaturas);
```

Resultado:

| nombre |
|---|

*0 filas*

**Resultado vacío**, aunque Nuria no imparte nada. La razón: «`5 NOT IN (1, 2, 3, 4, NULL)`» no es verdadero ni falso, sino **desconocido** (¿será el `NULL` un 5?). Las alternativas correctas son `NOT EXISTS` o filtrar los `NULL` de la subconsulta:

```sql
INSERT INTO profesores VALUES (5, 'Nuria Paz');
SELECT p.nombre FROM profesores p
WHERE NOT EXISTS (SELECT 1 FROM asignaturas s WHERE s.id_profesor = p.id);
```

Resultado:

| nombre |
|---|
| Nuria Paz |

*1 fila*

!!! tip "Regla práctica"
    Para «los que **no** tienen...» usa **`NOT EXISTS`** (o un `LEFT JOIN ... IS NULL`). Evita `NOT IN` con subconsultas que puedan contener `NULL`.

## Subconsulta en el FROM: una tabla temporal

El resultado de una consulta se puede usar **como si fuera una tabla** (hay que ponerle un alias). Es la forma de filtrar o calcular sobre un resultado **ya agrupado**: aquí, la **media de cada alumno** y después los que la tienen por encima de 7:

```sql
SELECT nombre, apellido, media
FROM (
  SELECT a.nombre, a.apellido, ROUND(AVG(n.nota), 2) AS media
  FROM alumnos a
  JOIN notas n ON n.id_alumno = a.id
  WHERE n.convocatoria = 1
  GROUP BY a.id, a.nombre, a.apellido
) AS medias
WHERE media > 7
ORDER BY media DESC;
```

Resultado:

| nombre | apellido | media |
|---|---|---|
| Iván | Torres | 8.5 |
| Marta | Díaz | 7.75 |
| Raúl | Campos | 7.67 |
| Lola | Ortiz | 7.5 |
| Sara | Vega | 7.13 |

*5 filas*

## Subconsulta correlacionada en el WHERE

Cuando la subconsulta **usa valores de la fila exterior**, se evalúa para cada fila. Las notas **más altas de cada asignatura** (comparando cada nota con el máximo **de su misma asignatura**):

```sql
SELECT s.nombre AS asignatura, a.nombre, n.nota
FROM notas n
JOIN alumnos a    ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
  AND n.nota = (SELECT MAX(n2.nota) FROM notas n2
                WHERE n2.id_asignatura = n.id_asignatura AND n2.convocatoria = 1)
ORDER BY s.nombre;
```

Resultado:

| asignatura | nombre | nota |
|---|---|---|
| Bases de Datos | Raúl | 9.0 |
| Entornos de Desarrollo | Iván | 10.0 |
| Inglés Técnico | Raúl | 6.5 |
| Lenguajes de Marcas | Sara | 9.5 |
| Programación | Iván | 9.5 |
| Sistemas Informáticos | Marcos | 9.5 |

*6 filas*

## ¿Subconsulta o JOIN?

Muchas preguntas se pueden resolver con las dos. Como orientación:

| Situación | Suele ser mejor |
|---|---|
| Necesitas **columnas** de la otra tabla en el resultado | `JOIN` |
| Solo necesitas **comprobar si existe** (o no) una relación | `EXISTS` / `NOT EXISTS` |
| Comparar con un **valor calculado** (media, máximo) | Subconsulta escalar |
| Filtrar sobre un **resultado agrupado** | Subconsulta en el `FROM` (o `WITH`, unidad 6) |

!!! info "ANY y ALL"
    PostgreSQL y MySQL permiten comparar con **cualquier** (`> ANY (...)`) o con **todos** (`> ALL (...)`) los valores de una subconsulta. SQLite no los tiene: se sustituyen por `MIN` y `MAX` (`> (SELECT MAX(...))` equivale a `> ALL`).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| La subconsulta devuelve **más de un valor** donde se espera uno | Usar `IN`, o asegurar un solo valor (agregado, `LIMIT 1`) |
| `NOT IN` con valores que pueden ser `NULL` | `NOT EXISTS` |
| Olvidar el alias de una subconsulta en el `FROM` | Todas las tablas derivadas necesitan alias |
| Subconsultas correlacionadas sobre tablas enormes sin índices | Valorar un `JOIN` o crear índices (unidad 6) |
| Mezclar los alias de la consulta exterior y la interior | Alias distintos (`n` y `n2`) |

## Para practicar

Los ejercicios S5.9 a S5.12 de [S5 · Ejercicios](ejercicios.md) practican las subconsultas.
