# 5.2 GROUP BY y HAVING

Los agregados resumen **toda la tabla**. Con **`GROUP BY`** se resume **por grupos**: una fila de resultado **por cada valor distinto** de la columna de agrupación.

## GROUP BY

¿Cuántos alumnos hay **en cada ciudad**?

```sql
SELECT ciudad, COUNT(*) AS alumnos
FROM alumnos
GROUP BY ciudad
ORDER BY alumnos DESC, ciudad;
```

Resultado:

| ciudad | alumnos |
|---|---|
| Cádiz | 5 |
| Sevilla | 4 |
| Jerez | 3 |
| Málaga | 2 |

*4 filas*

El motor agrupa las filas con la misma ciudad y calcula el `COUNT(*)` **dentro de cada grupo**.

**La regla de oro:** en el `SELECT` solo puede haber **las columnas por las que se agrupa** y **funciones de agregado**. Todo lo demás no tiene un valor único dentro del grupo.

### Agrupar tras un JOIN

Se combina con lo aprendido: la **media de cada asignatura** (con su nombre, que está en otra tabla):

```sql
SELECT s.nombre AS asignatura,
       COUNT(*)            AS notas,
       ROUND(AVG(n.nota), 2) AS media
FROM notas n
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
GROUP BY s.id, s.nombre
ORDER BY media DESC;
```

Resultado:

| asignatura | notas | media |
|---|---|---|
| Entornos de Desarrollo | 8 | 7.13 |
| Sistemas Informáticos | 4 | 7.13 |
| Programación | 9 | 6.67 |
| Lenguajes de Marcas | 8 | 6.63 |
| Bases de Datos | 13 | 5.81 |
| Inglés Técnico | 4 | 5.63 |

*6 filas*

Se agrupa por `s.id` y `s.nombre` (el `id` garantiza que dos asignaturas con el mismo nombre no se mezclen, y el nombre permite mostrarlo).

### Agrupar por varias columnas

Se obtiene una fila por cada **combinación** de valores:

```sql
SELECT g.nombre AS grupo, a.ciudad, COUNT(*) AS alumnos
FROM alumnos a
JOIN grupos g ON g.id = a.id_grupo
GROUP BY g.nombre, a.ciudad
ORDER BY g.nombre, a.ciudad;
```

Resultado:

| grupo | ciudad | alumnos |
|---|---|---|
| 1DAM-A | Cádiz | 2 |
| 1DAM-A | Sevilla | 2 |
| 1DAM-B | Cádiz | 1 |
| 1DAM-B | Jerez | 1 |
| 1DAM-B | Málaga | 1 |
| 1DAM-B | Sevilla | 2 |
| 2DAM-A | Cádiz | 2 |
| 2DAM-A | Jerez | 1 |
| … | … | … |

*9 filas* (se muestran 8)

## HAVING: filtrar los grupos

`WHERE` filtra **filas** antes de agrupar. Para filtrar **grupos** según su resultado (por ejemplo, «solo las ciudades con más de 2 alumnos») se usa **`HAVING`**, que va **después** del `GROUP BY`:

```sql
SELECT ciudad, COUNT(*) AS alumnos
FROM alumnos
GROUP BY ciudad
HAVING COUNT(*) >= 3
ORDER BY alumnos DESC;
```

Resultado:

| ciudad | alumnos |
|---|---|
| Cádiz | 5 |
| Sevilla | 4 |
| Jerez | 3 |

*3 filas*

| | `WHERE` | `HAVING` |
|---|---|---|
| Filtra | **Filas** | **Grupos** |
| Se aplica | **Antes** de agrupar | **Después** de agrupar |
| Puede usar agregados | **No** | **Sí** |

Se pueden usar los dos en la misma consulta. Aquí: de las notas de la convocatoria 1 (`WHERE`), las asignaturas **con media de 7 o más** (`HAVING`):

```sql
SELECT id_asignatura, ROUND(AVG(nota), 2) AS media
FROM notas
WHERE convocatoria = 1
GROUP BY id_asignatura
HAVING AVG(nota) >= 7;
```

Resultado:

| id_asignatura | media |
|---|---|
| 3 | 7.13 |
| 5 | 7.13 |

*2 filas*

## El orden de las cláusulas

Se escriben siempre en este orden, y el motor las **evalúa** en un orden distinto, que conviene tener en la cabeza:

| Se escribe | Se evalúa (aproximadamente) |
|---|---|
| `SELECT` | 5.º: qué columnas y cálculos mostrar |
| `FROM` / `JOIN` | 1.º: de dónde salen las filas |
| `WHERE` | 2.º: filtrar filas |
| `GROUP BY` | 3.º: agrupar |
| `HAVING` | 4.º: filtrar grupos |
| `ORDER BY` | 6.º: ordenar |
| `LIMIT` | 7.º: quedarse con las primeras |

Por eso en el `ORDER BY` se puede usar el **alias** del `SELECT` (se evalúa después), pero **no en el `WHERE`** (se evalúa antes).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Columna en el `SELECT` que no está en el `GROUP BY` ni es un agregado | Añadirla al `GROUP BY` o quitarla (SQLite no avisa; los demás motores sí) |
| Agregado en el `WHERE` | Usar `HAVING` |
| Filtrar con `HAVING` algo que debería ir en `WHERE` | Si no usa agregados, ponlo en `WHERE`: es más eficiente |
| Agrupar solo por el nombre cuando puede repetirse | Agrupar también por el `id` |
| Usar un alias en el `WHERE` | Repetir la expresión |

## Para practicar

Los ejercicios S5.3 a S5.8 de [S5 · Ejercicios](ejercicios.md) practican `GROUP BY` y `HAVING`.
