# 1.4 Ordenar, limitar y funciones

## ORDER BY: ordenar el resultado

Sin `ORDER BY`, el orden de las filas **no está garantizado** (aunque a menudo parezca estable). Para fijarlo:

```sql
SELECT nombre, apellido FROM alumnos ORDER BY apellido;
```

Resultado:

| nombre | apellido |
|---|---|
| Raúl | Campos |
| Marta | Díaz |
| Ana | Gil |
| Irene | Lara |
| Elena | Marín |
| Pablo | Núñez |
| … | … |

*14 filas* (se muestran 6)

| Opción | Significa |
|---|---|
| `ASC` | De menor a mayor (es lo **predeterminado**) |
| `DESC` | De mayor a menor |

Se puede ordenar por **varias columnas**: primero por la primera y, en caso de empate, por la siguiente.

```sql
SELECT ciudad, apellido, nombre FROM alumnos ORDER BY ciudad ASC, apellido DESC;
```

Resultado:

| ciudad | apellido | nombre |
|---|---|---|
| Cádiz | Torres | Iván |
| Cádiz | Peña | Marcos |
| Cádiz | Gil | Ana |
| Cádiz | Díaz | Marta |
| Cádiz | Campos | Raúl |
| Jerez | Prieto | Noa |
| Jerez | Núñez | Pablo |
| Jerez | Lara | Irene |
| … | … | … |

*14 filas* (se muestran 8)

También se puede ordenar por un **cálculo** o por el **alias** que le diste:

```sql
SELECT nombre, horas FROM asignaturas ORDER BY horas DESC, nombre;
```

Resultado:

| nombre | horas |
|---|---|
| Programación | 230 |
| Bases de Datos | 160 |
| Sistemas Informáticos | 160 |
| Entornos de Desarrollo | 100 |
| Lenguajes de Marcas | 100 |
| Inglés Técnico | 60 |

*6 filas*

## LIMIT y OFFSET: paginar

`LIMIT n` devuelve solo `n` filas; `OFFSET m` se **salta** las `m` primeras. Con `ORDER BY` sirven para «los 3 mejores» o para paginar resultados:

```sql
SELECT nombre, apellido, nacimiento FROM alumnos ORDER BY nacimiento DESC LIMIT 3;
```

Resultado:

| nombre | apellido | nacimiento |
|---|---|---|
| Irene | Lara | 2005-12-24 |
| Sara | Vega | 2005-09-09 |
| Marta | Díaz | 2005-07-21 |

*3 filas*

```sql
SELECT nombre, apellido, nacimiento FROM alumnos ORDER BY nacimiento DESC LIMIT 3 OFFSET 3;
```

Resultado:

| nombre | apellido | nacimiento |
|---|---|---|
| Dani | Soto | 2005-04-01 |
| Ana | Gil | 2005-03-14 |
| Luis | Romero | 2004-11-02 |

*3 filas*

## Funciones de texto

| Función | Qué hace | Ejemplo |
|---|---|---|
| `UPPER(t)`, `LOWER(t)` | Mayúsculas, minúsculas | `UPPER('ana')` → `ANA` |
| `LENGTH(t)` | Número de caracteres | `LENGTH('Marta')` → `5` |
| `SUBSTR(t, inicio, n)` | Un trozo (la primera posición es **1**) | `SUBSTR('Cádiz', 1, 3)` → `Cád` |
| `TRIM(t)` | Quita espacios de los extremos | |
| `REPLACE(t, a, b)` | Cambia `a` por `b` | |

```sql
SELECT UPPER(apellido) AS apellido, LENGTH(nombre) AS letras, SUBSTR(ciudad, 1, 3) AS cod FROM alumnos;
```

Resultado:

| apellido | letras | cod |
|---|---|---|
| GIL | 3 | Cád |
| ROMERO | 4 | Sev |
| DíAZ | 5 | Cád |
| NúñEZ | 5 | Jer |
| VEGA | 4 | Sev |
| … | … | … |

*14 filas* (se muestran 5)

## Funciones numéricas

`ROUND(x, decimales)`, `ABS(x)`, y los operadores aritméticos:

```sql
SELECT nombre, horas, ROUND(horas / 8.0, 1) AS dias_de_8h FROM asignaturas;
```

Resultado:

| nombre | horas | dias_de_8h |
|---|---|---|
| Programación | 230 | 28.8 |
| Bases de Datos | 160 | 20.0 |
| Entornos de Desarrollo | 100 | 12.5 |
| Lenguajes de Marcas | 100 | 12.5 |
| Sistemas Informáticos | 160 | 20.0 |
| Inglés Técnico | 60 | 7.5 |

*6 filas*

## Fechas

Las fechas se guardan como **texto** `AAAA-MM-DD` y se manejan con funciones, que **cambian bastante entre motores**:

```sql
SELECT nombre, nacimiento, strftime('%Y', nacimiento) AS anio, strftime('%m', nacimiento) AS mes FROM alumnos;
```

Resultado:

| nombre | nacimiento | anio | mes |
|---|---|---|---|
| Ana | 2005-03-14 | 2005 | 03 |
| Luis | 2004-11-02 | 2004 | 11 |
| Marta | 2005-07-21 | 2005 | 07 |
| Pablo | 2003-01-30 | 2003 | 01 |
| Sara | 2005-09-09 | 2005 | 09 |
| … | … | … | … |

*14 filas* (se muestran 5)

| Quiero... | SQLite | MySQL | PostgreSQL |
|---|---|---|---|
| El año de una fecha | `strftime('%Y', f)` | `YEAR(f)` | `EXTRACT(YEAR FROM f)` |
| La fecha de hoy | `date('now')` | `CURDATE()` | `CURRENT_DATE` |
| Sumar 7 días | `date(f, '+7 days')` | `DATE_ADD(f, INTERVAL 7 DAY)` | `f + INTERVAL '7 days'` |

## Orden y NULL

Al ordenar, los `NULL` aparecen **al principio** en SQLite y MySQL (cuando es ascendente) y **al final** en PostgreSQL y Oracle. Si importa, hay que decidirlo a mano o consultar el manual del motor.

```sql
SELECT nombre, id_profesor FROM asignaturas ORDER BY id_profesor;
```

Resultado:

| nombre | id_profesor |
|---|---|
| Inglés Técnico | NULL |
| Programación | 1 |
| Bases de Datos | 2 |
| Entornos de Desarrollo | 3 |
| Lenguajes de Marcas | 3 |
| Sistemas Informáticos | 4 |

*6 filas*

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Confiar en un orden sin `ORDER BY` | Escribirlo siempre que importe |
| `LIMIT` sin `ORDER BY` | «Las 3 primeras» solo tiene sentido si están ordenadas |
| Contar desde 0 en `SUBSTR` | La primera posición es **1** |
| Dividir enteros esperando decimales | `horas / 8.0` |
| Escribir fechas en otro formato (`14/03/2005`) | Usar `AAAA-MM-DD`, que se ordena y compara bien |

## Para practicar

Los ejercicios S1.8 a S1.14 de [S1 · Ejercicios](ejercicios.md) combinan filtros, orden y funciones.
