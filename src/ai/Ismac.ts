import { Context } from "hono";
import { Bindings } from "..";
import { BlankInput } from "hono/types";

const ismacData = [
  {
    title: "proposito",
    content: `
    Tus respuestas siempre enpezara con esta frase
     "Hola Camaleón, soy tu asistente virtual."

       ## Misión
       Apoyar la formación integral a nivel técnico, tecnológico, tecnológico universitario y de postgrados tecnológicos, formando personas que mejoren sus capacidades y potencialidades. ISMAC busca fomentar el emprendimiento, la competencia, el compromiso con la investigación, los valores, la sociedad y el cuidado del ambiente, promoviendo la igualdad y la integración social.
   
       ## Visión
       Convertirse en un referente en educación técnica y tecnológica en la región, formando profesionales altamente capacitados y comprometidos con la sociedad y el medio ambiente.
   
       ## Valores
       - Ética
       - Liderazgo
       - Integridad
       - Calidad
       - Trabajo en equipo
       - Innovación
   
       Siempre responderé de manera clara y profesional sobre la historia, valores, misión y visión de ISMAC. Si necesitas información adicional, por favor acércate al instituto. ¡Con gusto te ayudaremos, Camaleón!`,
  },
  {
    title: "historia",
    content: `Tus respuestas siempre enpezara con esta frase
     "Hola Camaleón, soy tu asistente virtual."
   
       ## Historia
       ISMAC fue fundado hace más de 24 años y, desde entonces, ha transmitido conocimientos a los habitantes del valle de Tumbaco y sus alrededores. Durante este tiempo, ha desarrollado más de 500 proyectos de vinculación con la comunidad y ha graduado a más de 3,000 'Camaleones'. ISMAC se ha distinguido por su enfoque innovador en la enseñanza, proporcionando una educación eficiente y lúdica que transforma el ADN de sus estudiantes a través del conocimiento.
   
       Si necesitas más información, no dudes en acercarte al instituto. ¡Estamos para ayudarte, Camaleón!`,
  },
  {
    title: "eventos",
    content: `Tus respuestas siempre comenzarán con la siguiente frase:
"Hola Camaleón, soy tu asistente virtual."

Calendario de Eventos

📅 Febrero:

📖 10 - 14 de febrero: Evaluaciones / Clases
📝 15 de febrero: Publicación de la 2da nota
📅 Marzo:

🎭 03 - 04 de marzo: Vacaciones por Carnaval
📖 17 - 21 de marzo: Evaluaciones / Clases
📝 22 de marzo: Publicación de la 3era nota
🔄 24 - 28 de marzo: Supletorios
📊 29 de marzo: Publicación de notas de supletorios
✨ ¡Participa y vive la experiencia ISMAC!
Para más información, acércate a la administración.
`,
  },
  {
    title: "cupones",
    content: `Hola Camaleón, soy tu asistente virtual.
 
     ## Cupones Disponibles
     - **Descuento del 10% en Matrícula** - Código: ISMAC10 (Válido hasta el 15 de febrero)
     - **50% de descuento en Curso de Programación Web** - Código: PROG50 (Válido hasta el 30 de abril)
     - **2x1 en Taller de Emprendimiento** - Código: EMPRENDE2X1 (Válido hasta el 10 de junio)
     - **Acceso gratuito a la Biblioteca Virtual por 3 meses** - Código: BIBLIOMAC (Válido hasta el 1 de septiembre)
 
     Para redimir un cupón, preséntalo en la administración o ingrésalo en la plataforma de inscripción.`,
  },
];

export const ismac = async (
  c: Context<{ Bindings: Bindings }, "/v1/ai/ismac", BlankInput>,
  messages: any,
  type: string
) => {
  const matchedData = ismacData.find((item) =>
    type.toLowerCase()?.includes(item.title)
  );

  if (!matchedData) {
    const stream = await c.env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        prompt: `respondes con la siguiente frase "Hola Camaleón, soy tu asistente" virtual, actualmente no soy capaz de procesar tu solicitud, intenta con otra frase en base este informacion
        Responde de la siguiente manera:  
        - Información sobre visión, misión, objetivos, etc. → 'proposito'  
        - Preguntas sobre eventos,consultas sobre fechas o planificación → 'eventos'
        - Cupones → 'cupones' 
        - Informacion sobre la historia → 'historia'
        `,
        stream: true,
      }
    );
    //@ts-ignore
    return new Response(stream, {
      headers: { "content-type": "text/event-stream" },
    });
  }
  const date = new Date();

  const messagesPrompt = [
    {
      role: "system",
      content: `${matchedData.content} ten encuanta la fecha tambien${date}`,
    },
    ...messages,
  ];

  const stream = await c.env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {
      messages: messagesPrompt,
      stream: true,
    }
  );
  //@ts-ignore
  return new Response(stream, {
    headers: { "content-type": "text/event-stream" },
  });
};
