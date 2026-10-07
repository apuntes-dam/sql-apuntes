# 2.1 Entidades y relaciones

## Por qué diseñar antes de crear tablas

Corregir un mal diseño **cuando ya hay datos** es caro y arriesgado. Por eso el trabajo se hace por etapas, de lo general a lo concreto:

| Etapa | Qué se hace | Resultado |
|---|---|---|
| **Análisis** | Entender qué datos hay y qué preguntas se querrán responder | Una lista de requisitos |
| **Modelo conceptual** | Dibujar **entidades y relaciones** (modelo entidad-relación, E-R) | Un diagrama, sin pensar aún en tablas |
| **Modelo lógico** | Convertir el diagrama en **tablas, claves y columnas** | Un esquema relacional |
| **Modelo físico** | Escribir el SQL (`CREATE TABLE`) para un motor concreto | La base de datos |

Esta página trata la segunda etapa; la siguiente, la tercera.

## Entidades y atributos

* Una **entidad** es algo del mundo real **sobre lo que guardamos información** y que se distingue de otras: un alumno, un pedido, un producto. Se nombra con un **sustantivo en singular** (`Alumno`), y se convierte en una tabla.
* Un **atributo** es una característica de la entidad: el nombre, la fecha de nacimiento. Se convierte en una columna.
* Un **identificador** es el atributo (o conjunto de atributos) que **distingue cada ejemplar**: no hay dos alumnos con el mismo. Será la **clave primaria**.

Hay varias clases de atributos, y cada una se trata de forma distinta:

| Clase | Qué es | Ejemplo | Qué se hace |
|---|---|---|---|
| **Simple** | Un único dato | `nombre` | Una columna |
| **Compuesto** | Se puede dividir en partes | `dirección` = calle + número + ciudad | Una columna por cada parte |
| **Multivaluado** | Puede tener **varios valores** a la vez | los teléfonos de una persona | Una **tabla aparte** |
| **Derivado** | Se **calcula** a partir de otros | la edad, que sale de la fecha de nacimiento | **No se guarda** |

!!! tip "No guardes lo que se puede calcular"
    Si guardas la edad, mañana estará mal. Guarda la fecha de nacimiento y calcula la edad cuando la necesites.

## Relaciones y cardinalidad

Una **relación** une entidades y se nombra con un **verbo**: un grupo *tiene* alumnos, un alumno *obtiene* notas. Lo más importante de una relación es su **cardinalidad**: **cuántos** elementos de un lado pueden relacionarse con cuántos del otro.

| Tipo | Se lee | Ejemplo |
|---|---|---|
| **1:1** (uno a uno) | Un A se relaciona con **un** B, y viceversa | Un usuario y su perfil |
| **1:N** (uno a muchos) | Un A se relaciona con **muchos** B, pero cada B con un solo A | Un grupo tiene muchos alumnos; cada alumno está en un grupo |
| **N:M** (muchos a muchos) | Un A se relaciona con muchos B **y** un B con muchos A | Un alumno cursa muchas asignaturas; una asignatura la cursan muchos alumnos |

Además hay que decidir si la participación es **obligatoria** (un pedido **debe** tener un cliente) u **opcional** (un alumno **puede** no tener grupo todavía). Se expresa con el mínimo: **0** (opcional) o **1** (obligatoria).

## Notación de «pata de gallo»

Una forma muy usada de escribir las cardinalidades es la de **pata de gallo**. Cada extremo de la línea indica el **mínimo y el máximo**:

| Extremo | Significa |
|---|---|
| `\|\|` | exactamente uno |
| `\|o` | cero o uno |
| `}\|` | uno o muchos |
| `}o` | cero o muchos |

El modelo de la base de datos del instituto, en esa notación, queda así:

```text
GRUPOS      ||--o{  ALUMNOS      : tiene
ALUMNOS     ||--o{  NOTAS        : obtiene
ASIGNATURAS ||--o{  NOTAS        : "se califica en"
PROFESORES  |o--o{  ASIGNATURAS  : imparte
```

Se lee de izquierda a derecha: «un grupo (`||`, exactamente uno) tiene **cero o muchos** alumnos (`o{`)»; y «una asignatura tiene **cero o un** profesor (`|o`), y un profesor imparte **cero o muchas** asignaturas».

## Atributos de una relación

A veces un dato **no pertenece a ninguna de las dos entidades**, sino a **la relación entre ellas**. La **nota** no es del alumno (tiene muchas) ni de la asignatura (tiene muchas): es del par **alumno-asignatura**. Lo mismo la fecha de un préstamo o la cantidad de un producto en un pedido. En el modelo lógico, esos atributos acaban en la **tabla que resuelve la relación N:M**.

## Cómo sacar el modelo de un enunciado

Un método sencillo, con este enunciado:

> *Una tienda vende productos. Cada producto pertenece a una categoría. Los clientes hacen pedidos y un pedido puede incluir varios productos, cada uno con una cantidad.*

1. **Subraya los sustantivos**: tienda, productos, categoría, clientes, pedidos, cantidad. Los importantes son **entidades**: `Producto`, `Categoria`, `Cliente`, `Pedido`. La *cantidad* es un atributo.
2. **Subraya los verbos** para encontrar las relaciones: «pertenece», «hacen», «incluir».
3. **Decide la cardinalidad de cada relación**, preguntando en los dos sentidos:
    * ¿Una categoría tiene muchos productos? **Sí.** ¿Un producto, varias categorías? **No** (en este enunciado) → **1:N**.
    * ¿Un cliente hace muchos pedidos? **Sí.** ¿Un pedido es de varios clientes? **No** → **1:N**.
    * ¿Un pedido incluye muchos productos? **Sí.** ¿Un producto está en muchos pedidos? **Sí** → **N:M**, con el atributo `cantidad` en la relación.
4. **Dibuja** el resultado:

```text
CATEGORIAS ||--o{ PRODUCTOS : agrupa
CLIENTES   ||--o{ PEDIDOS   : hace
PEDIDOS    }o--o{ PRODUCTOS : incluye   (atributo de la relación: cantidad)
```

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Convertir un atributo en entidad sin necesidad | Si solo hay un dato y no tiene sentido por sí mismo, es un atributo |
| Guardar datos derivados (edad, totales) | Calcúlalos en la consulta |
| Una relación N:M dibujada como 1:N | Pregunta siempre **en los dos sentidos** |
| Olvidar los atributos de la relación (nota, cantidad, fecha) | Pregúntate de **quién** es realmente cada dato |
| Nombres confusos o mezclados (singular y plural, inglés y español) | Elige una convención y úsala siempre |

## Para practicar

Los ejercicios de [S2 · Ejercicios](ejercicios.md) piden convertir enunciados en tablas.
