# 4.2 LEFT JOIN, autouniones y otros

## LEFT JOIN: conservar todas las filas de la izquierda

Con `JOIN`, Irene (sin grupo) desaparece. **`LEFT JOIN`** conserva **todas las filas de la tabla de la izquierda** (la que va antes del `JOIN`) y, si no encuentra pareja, rellena con **`NULL`** las columnas de la derecha:

```sql
SELECT a.nombre, a.apellido, g.nombre AS grupo
FROM alumnos a
LEFT JOIN grupos g ON g.id = a.id_grupo
ORDER BY a.id DESC;
```

Resultado:

| nombre | apellido | grupo |
|---|---|---|
| Álex | Roca | 1DAM-B |
| Irene | Lara | NULL |
| Marcos | Peña | 2DAM-A |
| Lola | Ortiz | 1DAM-B |
| … | … | … |

*14 filas* (se muestran 4)

Ahora salen **los 14 alumnos**, y Irene aparece con el grupo a `NULL`. Lo mismo con las asignaturas y sus profesores (la de inglés no tiene):

```sql
SELECT s.nombre AS asignatura, p.nombre AS profesor
FROM asignaturas s
LEFT JOIN profesores p ON p.id = s.id_profesor;
```

Resultado:

| asignatura | profesor |
|---|---|
| Programación | Marta Ruiz |
| Bases de Datos | Pedro Salas |
| Entornos de Desarrollo | Lucía Ferrer |
| Lenguajes de Marcas | Lucía Ferrer |
| Sistemas Informáticos | Hugo Navas |
| Inglés Técnico | NULL |

*6 filas*

| Tipo | Qué devuelve |
|---|---|
| `JOIN` / `INNER JOIN` | Solo las filas **con pareja** en las dos tablas |
| `LEFT JOIN` | Todas las de la **izquierda**, con `NULL` si no hay pareja |
| `RIGHT JOIN` | Todas las de la **derecha**, con `NULL` si no hay pareja |
| `FULL JOIN` | Todas las de **las dos**, con `NULL` donde no hay pareja |

`RIGHT JOIN` es lo mismo que un `LEFT JOIN` cambiando el orden de las tablas, así que casi siempre se escribe `LEFT JOIN`.

!!! info "Disponibilidad según el motor"
    `RIGHT JOIN` y `FULL JOIN` están en SQLite (desde la versión 3.39), PostgreSQL y SQL Server. **MySQL** tiene `RIGHT JOIN` pero **no `FULL JOIN`** (se simula uniendo un `LEFT JOIN` y un `RIGHT JOIN` con `UNION`).

## Encontrar lo que NO tiene pareja

Un truco muy útil: hacer un `LEFT JOIN` y quedarse **solo con las filas donde la pareja es `NULL`**. Responde a preguntas como «¿qué alumnos no tienen ninguna nota?»:

```sql
SELECT a.nombre, a.apellido
FROM alumnos a
LEFT JOIN notas n ON n.id_alumno = a.id
WHERE n.id_alumno IS NULL;
```

Resultado:

| nombre | apellido |
|---|---|
| Irene | Lara |

*1 fila*

Se han unido los alumnos con sus notas; los que **no tenían ninguna** quedan con `NULL` en las columnas de `notas`, y el `WHERE ... IS NULL` los deja solos. (Irene no tiene notas.)

!!! warning "El filtro en WHERE puede «deshacer» un LEFT JOIN"
    Si filtras por una columna de la tabla derecha **con una condición normal** (`WHERE g.curso = 2`), las filas con `NULL` se descartan y el `LEFT JOIN` se comporta como un `JOIN`. Para conservarlas, pon la condición en el `ON`, o compara con `IS NULL` si buscas precisamente las que no tienen pareja.

## Una tabla unida consigo misma (autounión)

A veces hay que **comparar filas de la misma tabla**. Se usa la tabla **dos veces**, con dos alias distintos. Por ejemplo, **parejas de alumnos de Jerez**:

```sql
SELECT a.nombre AS alumno_1, b.nombre AS alumno_2
FROM alumnos a
JOIN alumnos b ON b.ciudad = a.ciudad AND a.id < b.id
WHERE a.ciudad = 'Jerez';
```

Resultado:

| alumno_1 | alumno_2 |
|---|---|
| Pablo | Irene |
| Pablo | Noa |
| Noa | Irene |

*3 filas*

La condición `a.id < b.id` evita que cada pareja salga **dos veces** (Pablo-Noa y Noa-Pablo) y que un alumno se empareje **consigo mismo**.

## Recorrer varias tablas relacionadas

Se pueden encadenar tantos `JOIN` como haga falta. Por ejemplo, **quién puso cada nota** a la alumna 1 (nota → asignatura → profesor):

```sql
SELECT s.nombre AS asignatura, n.nota, p.nombre AS profesor
FROM notas n
JOIN asignaturas s ON s.id = n.id_asignatura
LEFT JOIN profesores p ON p.id = s.id_profesor
WHERE n.id_alumno = 1 AND n.convocatoria = 1;
```

Resultado:

| asignatura | nota | profesor |
|---|---|---|
| Programación | 3.5 | Marta Ruiz |
| Bases de Datos | 6.0 | Pedro Salas |
| Entornos de Desarrollo | 9.0 | Lucía Ferrer |
| Lenguajes de Marcas | 3.0 | Lucía Ferrer |

*4 filas*

Aquí se ha usado `LEFT JOIN` con los profesores para **no perder** las notas de asignaturas que aún no tienen profesor.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Usar `JOIN` cuando faltan filas que sí quieres ver | `LEFT JOIN` |
| Confundir cuál es la tabla «izquierda» | Es la que va **antes** de la palabra `LEFT JOIN` |
| Filtrar la tabla derecha en el `WHERE` y perder los `NULL` | Poner la condición en el `ON` |
| Autounión sin condición que evite repetir parejas | `a.id < b.id` |
| Buscar «sin pareja» con `= NULL` | `IS NULL` |

## Para practicar

Los ejercicios S4.5 a S4.9 de [S4 · Ejercicios](ejercicios.md) practican `LEFT JOIN`, autouniones y uniones de varias tablas.
