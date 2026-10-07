# 4.3 UNION, INTERSECT y EXCEPT

Un `JOIN` **añade columnas** (pega filas de tablas distintas «en horizontal»). Las **operaciones de conjuntos** combinan los **resultados de dos consultas** «en vertical»: suman filas, buscan lo común o restan.

| Operación | Devuelve |
|---|---|
| `UNION` | Las filas de **una u otra** consulta, **sin repetidas** |
| `UNION ALL` | Las filas de **una y otra**, **con repetidas** |
| `INTERSECT` | Solo las filas que están **en las dos** |
| `EXCEPT` | Las filas de la primera que **no están en la segunda** |

**Condición:** las dos consultas deben tener **el mismo número de columnas, con tipos compatibles**. Los nombres de las columnas del resultado son los de la **primera** consulta.

## UNION y UNION ALL

Una lista única con **todas las personas** del instituto (profesores y alumnos), indicando qué son:

```sql
SELECT nombre, 'profesor' AS rol FROM profesores
UNION
SELECT nombre || ' ' || apellido, 'alumno' FROM alumnos
ORDER BY rol, nombre;
```

Resultado:

| nombre | rol |
|---|---|
| Ana Gil | alumno |
| Dani Soto | alumno |
| Elena Marín | alumno |
| Irene Lara | alumno |
| Iván Torres | alumno |
| Lola Ortiz | alumno |
| … | … |

*18 filas* (se muestran 6)

Un único `ORDER BY` al final ordena **todo el resultado**.

La diferencia entre `UNION` y `UNION ALL` está en los repetidos. Las ciudades de dos grupos de alumnos:

```sql
SELECT ciudad FROM alumnos WHERE id_grupo = 1
UNION
SELECT ciudad FROM alumnos WHERE id_grupo = 3
ORDER BY ciudad;
```

Resultado:

| ciudad |
|---|
| Cádiz |
| Jerez |
| Málaga |
| Sevilla |

*4 filas*

Con `UNION ALL` no se eliminan los repetidos, y es **más rápido** (no tiene que comparar filas), por eso se prefiere cuando sabes que no habrá repetidos o no te importan:

```sql
SELECT ciudad FROM alumnos WHERE id_grupo = 1
UNION ALL
SELECT ciudad FROM alumnos WHERE id_grupo = 3
ORDER BY ciudad;
```

Resultado:

| ciudad |
|---|
| Cádiz |
| Cádiz |
| Cádiz |
| Cádiz |
| Jerez |
| Málaga |
| Sevilla |
| Sevilla |

*8 filas*

## INTERSECT: lo que tienen en común

Las ciudades en las que viven alumnos **del grupo 1 y también** del grupo 3:

```sql
SELECT ciudad FROM alumnos WHERE id_grupo = 1
INTERSECT
SELECT ciudad FROM alumnos WHERE id_grupo = 3;
```

Resultado:

| ciudad |
|---|
| Cádiz |

*1 fila*

## EXCEPT: restar

Los alumnos que **tienen notas** pero **nunca han suspendido en la primera convocatoria** (todos los que tienen alguna nota, menos los que tienen alguna nota por debajo de 5 en la convocatoria 1):

```sql
SELECT id_alumno FROM notas
EXCEPT
SELECT id_alumno FROM notas WHERE convocatoria = 1 AND nota < 5
ORDER BY id_alumno;
```

Resultado:

| id_alumno |
|---|
| 2 |
| 3 |
| 6 |
| 8 |
| 11 |

*5 filas*

!!! info "Disponibilidad según el motor"
    `UNION` y `UNION ALL` existen en todos los motores. `INTERSECT` y `EXCEPT` están en SQLite y PostgreSQL; en **MySQL** desde la versión 8.0.31; y en **Oracle** `EXCEPT` se llama **`MINUS`**. Muchas veces lo mismo se puede escribir con `IN`, `NOT IN` o `EXISTS` (unidad 5).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Consultas con distinto número de columnas | Deben coincidir en número y tipo |
| Un `ORDER BY` en cada consulta | Solo uno, al final, para todo el resultado |
| Esperar los repetidos con `UNION` | Usar `UNION ALL` si los quieres |
| Confundir `UNION` con `JOIN` | `UNION` suma **filas**; `JOIN` añade **columnas** |

## Para practicar

Los ejercicios S4.10 a S4.12 de [S4 · Ejercicios](ejercicios.md) practican las operaciones de conjuntos y las uniones de varias tablas.
