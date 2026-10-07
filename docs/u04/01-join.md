# 4.1 JOIN

## Por qué hacen falta los JOIN

La tabla `alumnos` solo guarda el **número** del grupo, no su nombre:

```sql
SELECT nombre, apellido, id_grupo FROM alumnos;
```

Resultado:

| nombre | apellido | id_grupo |
|---|---|---|
| Ana | Gil | 1 |
| Luis | Romero | 1 |
| Marta | Díaz | 1 |
| Pablo | Núñez | 2 |
| … | … | … |

*14 filas* (se muestran 4)

Para ver **«Ana Gil — 1DAM-A»** hay que unir `alumnos` con `grupos`, relacionando la clave foránea (`alumnos.id_grupo`) con la clave primaria (`grupos.id`).

## INNER JOIN

```sql
SELECT columnas
FROM tabla1
JOIN tabla2 ON condición_de_unión;
```

```sql
SELECT alumnos.nombre, alumnos.apellido, grupos.nombre AS grupo
FROM alumnos
JOIN grupos ON grupos.id = alumnos.id_grupo;
```

Resultado:

| nombre | apellido | grupo |
|---|---|---|
| Ana | Gil | 1DAM-A |
| Luis | Romero | 1DAM-A |
| Marta | Díaz | 1DAM-A |
| Pablo | Núñez | 1DAM-B |
| Sara | Vega | 1DAM-B |
| Iván | Torres | 1DAM-B |
| Elena | Marín | 2DAM-A |
| Raúl | Campos | 2DAM-A |
| Noa | Prieto | 2DAM-A |
| Dani | Soto | 1DAM-A |
| … | … | … |

*13 filas* (se muestran 10)

Qué ha hecho el motor: para **cada alumno**, ha buscado en `grupos` la fila cuyo `id` coincide con su `id_grupo` y ha **pegado** las dos filas en una.

Dos detalles importantes:

* **`JOIN` solo devuelve las filas que tienen pareja** (por eso se llama también *inner join*, unión interna). **Irene Lara**, que no tiene grupo, **no aparece**: salen 13 filas, no 14. Si no quieres perderla, se usa `LEFT JOIN` (siguiente apartado).
* Cuando dos tablas tienen una columna con **el mismo nombre** (`nombre` está en las dos) hay que **calificarla** con el nombre de la tabla: `alumnos.nombre`, `grupos.nombre`.

## Alias de tabla

Escribir los nombres completos cansa. Se les puede poner un **alias** corto:

```sql
SELECT a.nombre, a.apellido, g.nombre AS grupo, g.curso
FROM alumnos a
JOIN grupos g ON g.id = a.id_grupo
WHERE g.curso = 2
ORDER BY a.apellido;
```

Resultado:

| nombre | apellido | grupo | curso |
|---|---|---|---|
| Raúl | Campos | 2DAM-A | 2 |
| Elena | Marín | 2DAM-A | 2 |
| Marcos | Peña | 2DAM-A | 2 |
| Noa | Prieto | 2DAM-A | 2 |

*4 filas*

Con alias, `a.nombre` es el nombre del **alumno** y `g.nombre` el del **grupo**. El `WHERE` y el `ORDER BY` funcionan igual que en las consultas de una tabla.

!!! warning "Las columnas ambiguas dan error"
    Si una columna existe en las dos tablas y no la calificas, el motor no sabe a cuál te refieres:

    ```sql
    SELECT id, nombre FROM alumnos a JOIN grupos g ON g.id = a.id_grupo;
    ```
    
    Resultado: **error**
    
    ```text
    OperationalError: ambiguous column name: id
    ```
    
## Unir tres o más tablas

Se encadenan más `JOIN`. Para ver **qué nota tiene cada alumno en cada asignatura**, hay que pasar por la tabla intermedia `notas`:

```sql
SELECT a.nombre, a.apellido, s.nombre AS asignatura, n.nota
FROM notas n
JOIN alumnos a    ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
ORDER BY n.nota DESC;
```

Resultado:

| nombre | apellido | asignatura | nota |
|---|---|---|---|
| Iván | Torres | Entornos de Desarrollo | 10.0 |
| Sara | Vega | Lenguajes de Marcas | 9.5 |
| Iván | Torres | Programación | 9.5 |
| Marcos | Peña | Sistemas Informáticos | 9.5 |
| Ana | Gil | Entornos de Desarrollo | 9.0 |
| Raúl | Campos | Bases de Datos | 9.0 |
| Lola | Ortiz | Lenguajes de Marcas | 9.0 |
| Pablo | Núñez | Lenguajes de Marcas | 8.5 |
| … | … | … | … |

*46 filas* (se muestran 8)

Se lee de arriba a abajo: se parte de `notas`, se le **añade el alumno** de cada nota, y después **la asignatura**. Cada `JOIN` tiene su propia condición `ON`.

!!! tip "Cómo plantear un JOIN"
    1. Decide **qué quieres ver** (columnas) y qué tablas las contienen.
    2. Busca **el camino de claves foráneas** que une esas tablas.
    3. Escribe un `JOIN ... ON clave_foranea = clave_primaria` por cada salto.
    4. Añade `WHERE` y `ORDER BY` al final.

## ¿Y si me olvido del ON?

Sin condición de unión, el motor combina **cada fila de una tabla con cada fila de la otra**: es el **producto cartesiano**. Con 14 alumnos y 3 grupos, salen 14 × 3 filas, casi todas absurdas:

```sql
SELECT COUNT(*) AS filas FROM alumnos CROSS JOIN grupos;
```

Resultado:

| filas |
|---|
| 42 |

*1 fila*

Si una consulta devuelve **muchísimas más filas de las esperadas**, casi seguro falta o está mal una condición `ON`. Existe una sintaxis antigua que une tablas con comas y las condiciones en el `WHERE` (`FROM alumnos a, grupos g WHERE g.id = a.id_grupo`); funciona, pero es fácil olvidar la condición, así que se recomienda el `JOIN ... ON` explícito.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Faltan filas en el resultado | `JOIN` descarta las que no tienen pareja: ¿necesitas `LEFT JOIN`? |
| Salen demasiadas filas | Falta la condición `ON`, o es incorrecta |
| `ambiguous column name` | Califica la columna con el alias de su tabla |
| Unir por la columna equivocada (`a.id = g.id`) | Une **clave foránea con clave primaria**: `a.id_grupo = g.id` |
| Mezclar la condición de unión con los filtros | La unión va en `ON`; los filtros, en `WHERE` |

## Para practicar

Los ejercicios S4.1 a S4.4 de [S4 · Ejercicios](ejercicios.md) practican `JOIN`.
