# 6.5 WITH y funciones de ventana

## WITH: consultas por pasos (CTE)

Una **expresión de tabla común** (CTE) se escribe con `WITH` y es una consulta **con nombre** que se define **antes** de la principal. Se usa para dividir un problema complejo en pasos legibles, en lugar de anidar subconsultas:

```sql
WITH medias AS (
  SELECT id_alumno, ROUND(AVG(nota), 2) AS media
  FROM notas
  WHERE convocatoria = 1
  GROUP BY id_alumno
)
SELECT a.nombre, a.apellido, m.media
FROM medias m
JOIN alumnos a ON a.id = m.id_alumno
WHERE m.media > (SELECT AVG(media) FROM medias)
ORDER BY m.media DESC;
```

Resultado:

| nombre | apellido | media |
|---|---|---|
| Iván | Torres | 8.5 |
| Marta | Díaz | 7.75 |
| Raúl | Campos | 7.67 |
| Lola | Ortiz | 7.5 |
| Sara | Vega | 7.13 |
| Luis | Romero | 7.0 |
| Marcos | Peña | 6.67 |

*7 filas*

Se lee en dos pasos: **(1)** `medias` calcula la media de cada alumno; **(2)** la consulta principal usa `medias` como si fuera una tabla, y la compara con **la media de las medias**. Es el mismo resultado que con una subconsulta en el `FROM`, pero mucho más fácil de leer, y `medias` se puede **usar varias veces**.

Se pueden definir **varias** CTE separadas por comas, y cada una puede usar las anteriores.

### CTE recursivas

Una CTE puede **llamarse a sí misma** para recorrer estructuras jerárquicas (un organigrama, categorías con subcategorías) o **generar series**. Se escribe con `WITH RECURSIVE`: un caso base, `UNION ALL` y el paso recursivo, con una condición de parada. Aquí, una serie de números:

```sql
WITH RECURSIVE numeros(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM numeros WHERE n < 5
)
SELECT n, n * n AS cuadrado FROM numeros;
```

Resultado:

| n | cuadrado |
|---|---|
| 1 | 1 |
| 2 | 4 |
| 3 | 9 |
| 4 | 16 |
| 5 | 25 |

*5 filas*

## Funciones de ventana

Una **función de ventana** calcula un valor **para cada fila** mirando a **otras filas relacionadas** (su «ventana»), **sin juntarlas** en una sola como hace `GROUP BY`. Se reconocen por **`OVER (...)`**.

### Numerar y clasificar

* `ROW_NUMBER()` numera las filas (1, 2, 3...), sin empates.
* `RANK()` da la **posición**; si hay empate, repite el número y **se salta** el siguiente (1, 2, 2, 4).
* `DENSE_RANK()` igual, pero sin saltos (1, 2, 2, 3).

Las notas de Bases de Datos en la convocatoria 1, con su **posición**:

```sql
SELECT a.nombre, n.nota,
       RANK() OVER (ORDER BY n.nota DESC) AS posicion
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
WHERE n.id_asignatura = 2 AND n.convocatoria = 1
ORDER BY posicion;
```

Resultado:

| nombre | nota | posicion |
|---|---|---|
| Raúl | 9.0 | 1 |
| Iván | 8.5 | 2 |
| Marta | 8.0 | 3 |
| Sara | 7.5 | 4 |
| Dani | 7.0 | 5 |
| Lola | 7.0 | 5 |
| Luis | 6.5 | 7 |
| Ana | 6.0 | 8 |
| Marcos | 4.5 | 9 |
| Pablo | 3.5 | 10 |
| … | … | … |

*13 filas* (se muestran 10)

### PARTITION BY: una ventana por cada grupo

`PARTITION BY` divide las filas en grupos y calcula **dentro de cada grupo**. La nota de cada alumno comparada con **la media de su asignatura**, en la misma fila:

```sql
SELECT a.nombre, s.nombre AS asignatura, n.nota,
       ROUND(AVG(n.nota) OVER (PARTITION BY n.id_asignatura), 2) AS media_asignatura
FROM notas n
JOIN alumnos a     ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
ORDER BY s.nombre, n.nota DESC;
```

Resultado:

| nombre | asignatura | nota | media_asignatura |
|---|---|---|---|
| Raúl | Bases de Datos | 9.0 | 5.81 |
| Iván | Bases de Datos | 8.5 | 5.81 |
| Marta | Bases de Datos | 8.0 | 5.81 |
| Sara | Bases de Datos | 7.5 | 5.81 |
| Dani | Bases de Datos | 7.0 | 5.81 |
| Lola | Bases de Datos | 7.0 | 5.81 |
| … | … | … | … |

*46 filas* (se muestran 6)

Con `GROUP BY` habrías obtenido una sola fila por asignatura; aquí **se conservan todas las filas** y se añade la media como columna extra.

### Los primeros de cada grupo

Un problema clásico: «**la mejor nota de cada asignatura**». Se numeran las notas dentro de cada asignatura y se queda la primera (una CTE sirve para filtrar por el resultado de la función de ventana):

```sql
WITH ordenadas AS (
  SELECT n.id_asignatura, n.id_alumno, n.nota,
         ROW_NUMBER() OVER (PARTITION BY n.id_asignatura ORDER BY n.nota DESC) AS pos
  FROM notas n
  WHERE n.convocatoria = 1
)
SELECT s.nombre AS asignatura, a.nombre, o.nota
FROM ordenadas o
JOIN asignaturas s ON s.id = o.id_asignatura
JOIN alumnos a     ON a.id = o.id_alumno
WHERE o.pos = 1
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

### Acumulados y valores vecinos

Con `SUM(...) OVER (ORDER BY ...)` se obtienen **totales acumulados**, y con `LAG`/`LEAD`, el valor de la fila **anterior o siguiente**:

```sql
SELECT nombre, nacimiento,
       LAG(nombre) OVER (ORDER BY nacimiento) AS el_anterior_en_edad
FROM alumnos
ORDER BY nacimiento
LIMIT 4;
```

Resultado:

| nombre | nacimiento | el_anterior_en_edad |
|---|---|---|
| Marcos | 2002-10-10 | NULL |
| Elena | 2002-12-05 | Marcos |
| Pablo | 2003-01-30 | Elena |
| Raúl | 2003-06-25 | Pablo |

*4 filas*

!!! info "Disponibilidad"
    Las funciones de ventana están en SQLite (desde la 3.25), PostgreSQL, Oracle, SQL Server y MySQL (desde la 8.0). Las CTE, en SQLite (3.8.3), PostgreSQL, Oracle, SQL Server y MySQL 8.0. En versiones antiguas de MySQL no existen.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Usar una función de ventana en el `WHERE` | No se puede: ponla en una CTE o subconsulta y filtra fuera |
| Confundir `PARTITION BY` con `GROUP BY` | `PARTITION BY` **no reduce** las filas |
| `ROW_NUMBER` cuando hay empates y los quieres todos | `RANK` o `DENSE_RANK` |
| Una CTE recursiva sin condición de parada | Siempre un `WHERE` que acabe la recursión |
| Olvidar el `ORDER BY` dentro del `OVER` en `ROW_NUMBER`/`RANK` | Sin él, el orden es arbitrario |

## Para practicar

Los ejercicios S6.8 a S6.11 de [S6 · Ejercicios](ejercicios.md) practican `WITH` y las funciones de ventana.
