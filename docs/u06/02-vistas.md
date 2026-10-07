# 6.2 Vistas

Una **vista** es una **consulta guardada con un nombre**. Se usa como si fuera una tabla, pero **no almacena datos propios**: cada vez que la consultas, el motor ejecuta la consulta que hay detrás.

## Crear y usar una vista

La consulta que une notas, alumnos y asignaturas es larga y se necesita a menudo. Se guarda una vez:

```sql
CREATE VIEW expediente AS
SELECT a.id AS id_alumno,
       a.nombre || ' ' || a.apellido AS alumno,
       s.nombre AS asignatura,
       n.convocatoria,
       n.nota
FROM notas n
JOIN alumnos a     ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura;
SELECT * FROM expediente WHERE id_alumno = 3;
```

Resultado:

| id_alumno | alumno | asignatura | convocatoria | nota |
|---|---|---|---|---|
| 3 | Marta Díaz | Programación | 1 | 8.0 |
| 3 | Marta Díaz | Bases de Datos | 1 | 8.0 |
| 3 | Marta Díaz | Entornos de Desarrollo | 1 | 8.0 |
| 3 | Marta Díaz | Lenguajes de Marcas | 1 | 7.0 |

*4 filas*

Ahora, para ver el expediente de una alumna, basta con un `SELECT` sencillo sobre `expediente`. Se puede **filtrar, ordenar y agrupar** la vista como una tabla normal:

```sql
CREATE VIEW expediente AS
SELECT a.id AS id_alumno,
       a.nombre || ' ' || a.apellido AS alumno,
       s.nombre AS asignatura,
       n.convocatoria,
       n.nota
FROM notas n
JOIN alumnos a     ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura;
SELECT asignatura, ROUND(AVG(nota), 2) AS media
FROM expediente
WHERE convocatoria = 1
GROUP BY asignatura
ORDER BY media DESC;
```

Resultado:

| asignatura | media |
|---|---|
| Sistemas Informáticos | 7.13 |
| Entornos de Desarrollo | 7.13 |
| Programación | 6.67 |
| Lenguajes de Marcas | 6.63 |
| Bases de Datos | 5.81 |
| Inglés Técnico | 5.63 |

*6 filas*

## La vista siempre está al día

Como no guarda copia de los datos, **refleja los cambios de las tablas** de inmediato:

```sql
CREATE VIEW expediente AS
SELECT a.id AS id_alumno,
       a.nombre || ' ' || a.apellido AS alumno,
       s.nombre AS asignatura,
       n.convocatoria,
       n.nota
FROM notas n
JOIN alumnos a     ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura;
UPDATE notas SET nota = 10 WHERE id_alumno = 3 AND id_asignatura = 1;
SELECT asignatura, nota FROM expediente WHERE id_alumno = 3 AND asignatura = 'Programación';
```

Resultado:

| asignatura | nota |
|---|---|
| Programación | 10.0 |

*1 fila*

## Para qué sirven

| Ventaja | Explicación |
|---|---|
| **Reutilizar** | Una consulta complicada se escribe una sola vez |
| **Simplificar** | Quien consulta no necesita conocer los `JOIN` |
| **Seguridad** | Se puede dar permiso sobre una vista que **solo muestra algunas columnas o filas** (por ejemplo, sin datos personales) y no sobre las tablas |
| **Estabilidad** | Si la estructura cambia, se actualiza la vista y las consultas que la usan siguen funcionando |

## Cambiar y borrar vistas

* `DROP VIEW expediente;` borra la vista (los datos de las tablas no se tocan).
* `CREATE VIEW IF NOT EXISTS ...` crea la vista solo si no existe.
* Para **modificar** una vista, en SQLite se borra y se vuelve a crear; MySQL y PostgreSQL tienen `CREATE OR REPLACE VIEW`.

!!! info "Cosas que dependen del motor"
    * Las vistas **sencillas** (una sola tabla, sin agregados) suelen poder **modificarse** con `INSERT`, `UPDATE` y `DELETE`; las que tienen `JOIN` o agrupaciones, normalmente no.
    * PostgreSQL y Oracle tienen **vistas materializadas**: guardan el resultado en disco y hay que **refrescarlas**. Son más rápidas de consultar pero pueden estar desactualizadas. SQLite y MySQL no las tienen.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Pensar que una vista guarda una copia de los datos | Solo guarda la **consulta** |
| Vistas que usan otras vistas, que usan otras... | Difíciles de entender y lentas: mantenlas simples |
| Intentar modificar datos a través de una vista con `JOIN` | Modificar las tablas |
| `SELECT *` dentro de una vista | Escribe las columnas: si la tabla cambia, la vista no se rompe |

## Para practicar

Los ejercicios S6.4 y S6.5 de [S6 · Ejercicios](ejercicios.md) practican las vistas.
