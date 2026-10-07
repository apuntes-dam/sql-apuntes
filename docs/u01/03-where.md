# 1.3 WHERE: filtrar filas

`WHERE` deja solo las **filas que cumplen una condición**. Va después de `FROM`:

```sql
SELECT nombre, apellido, ciudad FROM alumnos WHERE ciudad = 'Cádiz';
```

Resultado:

| nombre | apellido | ciudad |
|---|---|---|
| Ana | Gil | Cádiz |
| Marta | Díaz | Cádiz |
| Iván | Torres | Cádiz |
| Raúl | Campos | Cádiz |
| Marcos | Peña | Cádiz |

*5 filas*

## Operadores de comparación

| Operador | Significa | Ejemplo |
|---|---|---|
| `=` | igual (**un solo** `=`) | `ciudad = 'Jerez'` |
| `<>` o `!=` | distinto | `ciudad <> 'Cádiz'` |
| `<`, `<=` | menor, menor o igual | `horas < 100` |
| `>`, `>=` | mayor, mayor o igual | `nota >= 5` |

```sql
SELECT nombre, horas FROM asignaturas WHERE horas >= 160;
```

Resultado:

| nombre | horas |
|---|---|
| Programación | 230 |
| Bases de Datos | 160 |
| Sistemas Informáticos | 160 |

*3 filas*

Los textos se comparan **letra a letra** y los números como números. Las **fechas** guardadas como texto en formato `AAAA-MM-DD` se comparan bien con `<` y `>`, porque el orden alfabético coincide con el cronológico:

```sql
SELECT nombre, apellido, nacimiento FROM alumnos WHERE nacimiento >= '2005-01-01';
```

Resultado:

| nombre | apellido | nacimiento |
|---|---|---|
| Ana | Gil | 2005-03-14 |
| Marta | Díaz | 2005-07-21 |
| Sara | Vega | 2005-09-09 |
| Dani | Soto | 2005-04-01 |
| Irene | Lara | 2005-12-24 |

*5 filas*

## Combinar condiciones: AND, OR, NOT

| Operador | Resultado |
|---|---|
| `AND` | Se cumplen **las dos** |
| `OR` | Se cumple **al menos una** |
| `NOT` | Invierte la condición |

```sql
SELECT nombre, ciudad, id_grupo FROM alumnos WHERE ciudad = 'Cádiz' AND id_grupo = 1;
```

Resultado:

| nombre | ciudad | id_grupo |
|---|---|---|
| Ana | Cádiz | 1 |
| Marta | Cádiz | 1 |

*2 filas*

```sql
SELECT nombre, ciudad FROM alumnos WHERE ciudad = 'Jerez' OR ciudad = 'Málaga';
```

Resultado:

| nombre | ciudad |
|---|---|
| Pablo | Jerez |
| Elena | Málaga |
| Noa | Jerez |
| Lola | Málaga |
| Irene | Jerez |

*5 filas*

!!! warning "AND se evalúa antes que OR: usa paréntesis"
    `AND` tiene **más prioridad** que `OR`, igual que la multiplicación respecto a la suma. Esta consulta **no** devuelve lo que parece:

    ```sql
    SELECT nombre, ciudad, id_grupo FROM alumnos WHERE ciudad = 'Jerez' OR ciudad = 'Málaga' AND id_grupo = 3;
    ```
    
    Resultado:
    
    | nombre | ciudad | id_grupo |
    |---|---|---|
    | Pablo | Jerez | 2 |
    | Elena | Málaga | 3 |
    | Noa | Jerez | 3 |
    | Irene | Jerez | NULL |
    
    *4 filas*
    
    Se ha leído como «Jerez, **o** (Málaga **y** grupo 3)». Para «(Jerez o Málaga) **y** grupo 3» hay que poner paréntesis:

    ```sql
    SELECT nombre, ciudad, id_grupo FROM alumnos WHERE (ciudad = 'Jerez' OR ciudad = 'Málaga') AND id_grupo = 3;
    ```
    
    Resultado:
    
    | nombre | ciudad | id_grupo |
    |---|---|---|
    | Elena | Málaga | 3 |
    | Noa | Jerez | 3 |
    
    *2 filas*
    
## IN, BETWEEN y LIKE

Tres atajos muy usados:

**`IN`** comprueba si un valor está en una lista (en lugar de varios `OR`):

```sql
SELECT nombre, ciudad FROM alumnos WHERE ciudad IN ('Jerez', 'Málaga');
```

Resultado:

| nombre | ciudad |
|---|---|
| Pablo | Jerez |
| Elena | Málaga |
| Noa | Jerez |
| Lola | Málaga |
| Irene | Jerez |

*5 filas*

**`BETWEEN`** comprueba un rango, **incluyendo** los dos extremos:

```sql
SELECT nombre, horas FROM asignaturas WHERE horas BETWEEN 100 AND 160;
```

Resultado:

| nombre | horas |
|---|---|
| Bases de Datos | 160 |
| Entornos de Desarrollo | 100 |
| Lenguajes de Marcas | 100 |
| Sistemas Informáticos | 160 |

*4 filas*

**`LIKE`** busca **patrones** de texto, con dos comodines: `%` (cualquier cantidad de caracteres, incluso ninguno) y `_` (exactamente un carácter):

| Patrón | Encuentra |
|---|---|
| `'M%'` | Empieza por M |
| `'%z'` | Acaba en z |
| `'%ar%'` | Contiene «ar» |
| `'_ara'` | Cuatro letras que acaban en «ara» (Sara) |

```sql
SELECT nombre, apellido FROM alumnos WHERE nombre LIKE 'M%';
```

Resultado:

| nombre | apellido |
|---|---|
| Marta | Díaz |
| Marcos | Peña |

*2 filas*

!!! info "Mayúsculas en LIKE"
    En SQLite y MySQL, `LIKE` **no distingue** mayúsculas y minúsculas (para letras sin tilde). En PostgreSQL sí las distingue: allí se usa `ILIKE`.

## NULL: el valor «desconocido»

`NULL` significa **ausencia de valor**. Tiene una regla importante: **no se puede comparar con `=`**, porque «no sé cuál es» no es igual a nada, ni siquiera a otro «no sé». Esta consulta no devuelve nada, aunque hay un alumno sin grupo:

```sql
SELECT nombre FROM alumnos WHERE id_grupo = NULL;
```

Resultado:

| nombre |
|---|

*0 filas*

Hay que usar **`IS NULL`** o **`IS NOT NULL`**:

```sql
SELECT nombre, apellido FROM alumnos WHERE id_grupo IS NULL;
```

Resultado:

| nombre | apellido |
|---|---|
| Irene | Lara |

*1 fila*

```sql
SELECT nombre, id_profesor FROM asignaturas WHERE id_profesor IS NOT NULL;
```

Resultado:

| nombre | id_profesor |
|---|---|
| Programación | 1 |
| Bases de Datos | 2 |
| Entornos de Desarrollo | 3 |
| Lenguajes de Marcas | 3 |
| Sistemas Informáticos | 4 |

*5 filas*

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Comparar con `NULL` usando `=` | `IS NULL` / `IS NOT NULL` |
| Mezclar `AND` y `OR` sin paréntesis | Poner paréntesis siempre que mezcles |
| Usar `==` como en un lenguaje de programación | En SQL la igualdad es un solo `=` |
| Olvidar las comillas en un texto | `ciudad = 'Cádiz'` |
| `BETWEEN 10 AND 5` (extremos al revés) | El menor primero |

## Para practicar

Los ejercicios S1.4 a S1.9 de [S1 · Ejercicios](ejercicios.md) practican `WHERE`.
