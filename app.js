// --- REFERENCIAS DEL DOM ---
const messageList = document.getElementById('messageList');
const userInput = document.getElementById('userInput');
const mascotImage = document.getElementById('mascotImage');
const appContainer = document.getElementById('appContainer');
const chatbotLauncher = document.getElementById('chatbotLauncher');

// --- INTERFAZ DEL CHATBOT ---
function toggleChatbot() {
    if (appContainer.classList.contains('active')) {
        // Cerrar chatbot
        appContainer.classList.remove('active');
        chatbotLauncher.classList.remove('hidden');
    } else {
        // Abrir chatbot
        appContainer.classList.add('active');
        chatbotLauncher.classList.add('hidden');
        userInput.focus(); // Focus the input when opened
    }
}

// --- CONSTANTES PARA ANIMACIÓN DE MASCOTA ---
const IMG_BASE = "jagu3.png"; // Sonriendo, base
const IMG_TALK1 = "jagu2.png"; // Frame de hablar 1
const IMG_TALK2 = "jagu1.png"; // Frame de hablar 2
let talkInterval;

// --- MEMORIA DEL AGENTE ---
let memory = {
    userName: null,
    greetings: 0,
    howAreYou: 0,
    interestedCareer: null,
    consecutiveFails: 0
};

// --- UTILIDADES ---
// Almacena el último índice seleccionado para cada array, garantizando que NUNCA repita la misma frase dos veces seguidas.
const lastChoices = new WeakMap();

const smartRandomChoice = (arr) => {
    if (!arr || arr.length === 0) return "";
    if (arr.length === 1) return arr[0];

    const lastIndex = lastChoices.has(arr) ? lastChoices.get(arr) : -1;
    let newIndex;
    
    // Garantizar matemáticamente anti-repetición Turing
    do {
        newIndex = Math.floor(Math.random() * arr.length);
    } while (newIndex === lastIndex);

    lastChoices.set(arr, newIndex);
    return arr[newIndex];
};

// --- MOTOR DE PROCESAMIENTO DE LENGUAJE NATURAL (NLP) AVANZADO ---
const knowledgeBase = [
    // 1. Identidad y Nombre del Usuario
    {
        pattern: /(?:me llamo|mi nombre es|soy) (\w+)/i,
        fuzzyKeywords: ["llamo", "nombre", "soy"],
        handler: (match) => {
            memory.userName = match && match[1] ? match[1] : null;
            if (memory.userName) {
                return smartRandomChoice([
                    `¡Mucho gusto, ${memory.userName}! Qué bonito nombre. ¿En qué te puedo ayudar hoy?`,
                    `¡Hola ${memory.userName}! Ya me aprendí tu nombre. Dime, ¿qué necesitas consultar del ITESCO?`,
                    `Perfecto, te llamaré ${memory.userName}. ¡Dime! ¿Qué te trae por aquí?`,
                    `¡Bienvenido al sistema, ${memory.userName}! Soy todo oídos. `
                ]);
            }
            return "¡Mucho gusto! Siendo una IA a veces me cuesta pescar los nombres a la primera... ¿en qué te ayudo?";
        }
    },
    // 2. Tiempo y Fecha
    {
        pattern: /\b(hora|hora es|que hora|tienes hora|hora actual)\b/i,
        fuzzyKeywords: ["hora", "reloj", "tiempo"],
        handler: () => {
            const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            return smartRandomChoice([
                ` Según mi reloj interno, son las ${time}. ¡El tiempo vuela cuando programas!`,
                `Son exactamente las ${time}. Ideal para seguir estudiando.`,
                `Mi procesador me indica que marcan las ${time}. ¿Necesitas ayuda con algo más?`,
                `El servidor registra las ${time} en este instante. `
            ]);
        }
    },
    {
        pattern: /\b(dia es|fecha de hoy|que dia estamos|que dia es hoy)\b/i,
        fuzzyKeywords: ["hoy", "dia", "actual", "estamos"],
        handler: () => {
            const date = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return smartRandomChoice([
                ` Hoy es ${date}. Un excelente día para avanzar profesionalmente.`,
                `La fecha actual del sistema es ${date}. ¿En qué te asesoro hoy?`,
                `Estamos a ${date}. Recuerda siempre estar atento al calendario escolar.`
            ]);
        }
    },
    // 3. Saludos
    {
        pattern: /\b(hola|buenos dias|buenas tardes|buenas noches|saludos|hey|que onda|holi|que tal)\b/i,
        fuzzyKeywords: ["hola", "buenos", "dias", "tardes", "noches", "saludos", "onda"],
        handler: () => {
            memory.greetings++;
            if (memory.userName) {
                return smartRandomChoice([
                    `¡Hola de nuevo, ${memory.userName}! ¿En qué te ayudo esta vez?`,
                    `¡Qué gusto verte por aquí otra vez, ${memory.userName}! Dime tus dudas.`,
                    `¡Hola ${memory.userName}! Listo para darte información administrativa o escolar.`
                ]);
            }
            if (memory.greetings === 1) {
                return smartRandomChoice([
                    "¡Hola! Qué gusto saludarte. Soy Jaguarundi, la Inteligencia Artificial del ITESCO. ¿Tienes alguna pregunta en la que pueda apoyarte?",
                    "¡Buen día! Aquí Jaguarundi, tu asistente virtual. Puedo informarte sobre admisiones y la variada oferta educativa del tecnológico.",
                    "¡Saludos! Soy el asistente virtual oficial del Tec. Pregúntame sobre cualquier carrera tecnológica de nuestra familia ITESCO."
                ]);
            }
            return smartRandomChoice([
                "¡Hola otra vez! ¿Hay algún otro tema que quieras explorar?",
                "Dime, ¿en qué te puedo apoyar ahora? ",
                "¡Saludos nuevamente! ¿Buscamos alguna información específica de inscripciones o materias?",
                "¡Hey! Sigo en línea, preparado para aclarar todo sobre tu estancia universitaria."
            ]);
        }
    },
    // 4. Estímulos Conversacionales
    {
        pattern: /\b(como estas|como te va|como andas|que haces)\b/i,
        fuzzyKeywords: ["estas", "andas", "haces", "sientes"],
        handler: () => {
            memory.howAreYou++;
            return smartRandomChoice([
                "¡A máxima capacidad de procesamiento! ¿Y tú cómo estás?",
                "Muy bien, gracias por preguntar. ¡Ansioso por procesar consultas de nuestros alumnos!",
                "¡De maravilla! Aquí indexando artículos de la web del ITESCO. ¿En qué te apoyo?",
                "Con los engranes bien lubricados y los transistores cargados.  ¿Listo para ver las ingenierías?"
            ]);
        }
    },
    {
        pattern: /\b(bien|excelente|muy bien|super|genial|perfecto)\b/i,
        fuzzyKeywords: ["bien", "excelente", "super", "genial", "perfecto"],
        handler: () => smartRandomChoice([
            "¡Me alegra muchísimo! ¿Hay alguna carrera del ITESCO que te llame la atención?",
            "¡Qué buena actitud! A ver, cuéntame, ¿tienes dudas puntuales sobre nuestra institución?",
            "Me da mucho gusto oírlo (o leerlo, en este caso ). ¿Te gustaría hablar sobre el sistema Escolarizado o el modelo en Línea?",
            "¡Formidable! Si sientes curiosidad, pídeme información de cómo sacar ficha de admisión."
        ])
    },
    {
        pattern: /\b(mal|triste|cansado|estresado|enojado)\b/i,
        fuzzyKeywords: ["mal", "triste", "cansado", "estresado", "enojado"],
        handler: () => smartRandomChoice([
            "Oh, lamento mucho escuchar eso. Si sientes estrés por trámites, yo puedo quitarte la carga de buscar información y dártela resumida. ¿Qué trámite te tiene agobiado?",
            "Comprendo. La vida universitaria a veces pesa, pero todo esfuerzo rinde frutos. ¿Te sirvo de ayuda agilizando una búsqueda escolar?",
            "Un buen descanso de la pantalla hace maravillas. Cuando estés menos abrumado, aquí estaré listo para dar fechas o requisitos."
        ])
    },
    // 5. Existenciales / Identidad del Bot
    {
        pattern: /\b(quien eres|que eres|como te llamas|eres un bot|eres ia|inteligencia artificial)\b/i,
        fuzzyKeywords: ["quien", "eres", "llamas", "bot", "inteligencia", "ia"],
        handler: () => smartRandomChoice([
            "¡Soy 100% Inteligencia Artificial!  Me llamo Jaguarundi y vivo en los servidores para apoyar de inmediato a los preuniversitarios del ITESCO. ",
            "Soy un Agente Conversacional construido para agilizar reportes académicos. Respondo tan rápido como mi procesador neural me lo permite.",
            "Muchos me ven como la mascota, ¡pero soy tu asistente! Jaguarundi IA, respondiendo a toda velocidad preguntas frecuentes de inscripciones.",
            "No tengo cuerpo, solo código. Vivo en el portal del Instituto Tecnológico Superior de Coatzacoalcos para orientar a alumnos."
        ])
    },
    {
        pattern: /\b(quien te creo|creador|de donde vienes|naciste)\b/i,
        fuzzyKeywords: ["creo", "creador", "naciste", "origen", "inventor"],
        handler: () => smartRandomChoice([
            "Fui desarrollado por una gran colaboración de ingenieros de esta gloriosa institución. ¡La automatización al servicio estudiantil!",
            "El ITESCO me concibió con la visión de hacer sus interacciones digitales más ricas. Soy la evolución de la asistencia tradicional.",
            "Vengo de docenas de líneas de código escritas por personas que quieren ver crecer al tecnológico."
        ])
    },
    // 6. Humor
    {
        pattern: /\b(chiste|broma|aburrido|chistoso|hazme reir|cuentame algo)\b/i,
        fuzzyKeywords: ["chiste", "broma", "reir", "chistoso", "aburrido"],
        handler: () => smartRandomChoice([
            "¿Qué le dice un bit a otro? ... ¡Nos vemos en el bus! ",
            "Hay 10 tipos de personas en el mundo: Las que entienden binario, y las que no. ",
            "¿Por qué los programadores prefieren la oscuridad? ... ¡Porque los bichos (bugs) se ven con la luz! ",
            "Un administrador de base de datos entra a un bar, va a unas mesas, y dice: '¿Me puedo hacer un Join?' "
        ])
    },
    // 7. ITESCO - Oferta Educativa General y Modalidades
    {
        pattern: /\b(que carreras|carreras ofrecen|oferta educativa|licenciaturas|ingenierias|que puedo estudiar|que materias)\b/i,
        fuzzyKeywords: ["carreras", "ofrecen", "oferta", "educativa", "ingenierias", "licenciaturas", "estudiar"],
        handler: () => smartRandomChoice([
            " En ITESCO manejamos programas de excelencia: Animación Digital, Bioquímica, Eléctrica, Electrónica, Gestión Empresarial, Semiconductores, Sistemas Computacionales, Ferroviaria, Industrial, Mecatrónica, Informática y la Licenciatura en Administración.",
            "Nuestra impresionante oferta incluye Ingeniería Ferroviaria, Semiconductores, Animación Digital, Bioquímica, Eléctrica, Electrónica, Mecatrónica e Industrial. ¡Además de áreas administrativas como Gestión y la Lic. en Administración! ",
            "Aquí puedes ser Ingeniero en Sistemas, Informática, Mecatrónica, Industrial, Animación, o también especializarte en Ferroviaria y Semiconductores. Todo presencial o en línea.",
            "¿Buscas innovación? Prueba Semiconductores, Ferroviaria o Animación Digital. ¿Cimientos sólidos? Sistemas, Gestión, Administración, Eléctrica, Bioquímica, Informática, Industrial o Mecatrónica. ¡Todas en ITESCO!"
        ])
    },
    {
        pattern: /\b(distancia|en linea|virtual|sabados|no escolarizado|modalidad|modalidades|modelo de estudio|sabatino)\b/i,
        fuzzyKeywords: ["distancia", "linea", "virtual", "sabados", "escolarizado", "modalidad", "modelo", "estudio", "modalidades"],
        handler: () => smartRandomChoice([
            "👨‍ Ofrecemos tres grandes esquemas de estudio: Sistema Escolarizado tradicional (lunes a viernes), Sistema No Escolarizado (sábados) y el recién lanzado 'Educación a Distancia' (virtual). Lo adaptas totalmente a ti.",
            "Las Convocatorias ahora incluyen 'Ingenierías en Línea' que benefician especialmente a estudiantes que trabajan. ¡La mejor calidad académica sin afectar tu empleo!",
            "Contamos con modalidades presenciales e híbridas sabatinas (Sistema No Escolarizado) así como modelos Completamente en Línea, ideales para la formación técnica con alta flexibilidad."
        ])
    },
    {
        pattern: /\b(quiero estudiar|me interesa|me llama la atencion) (.+)\b/i,
        handler: (match) => {
            if(match && match[2]){
                memory.interestedCareer = match[2].trim();
                return smartRandomChoice([
                    `¡Wow! Apostar por ${memory.interestedCareer} te garantiza mucho campo laboral saliendo del ITESCO. ¿Tienes dudas con el temario, materias o requisitos de ingreso?`,
                    `Excelente elección, ${memory.interestedCareer} tiene laboratorios muy equipados. Puedo orientarte en el registro de la Convocatoria.`,
                    `El mundo necesita expertos en eso precisamente. En el Tec tenemos catedráticos especialistas que te impulsarán al éxito. ¿Qué deseas saber sobre admisiones?`,
                    `Ese campo de estudio ha subido su demanda últimamente. Con la capacitación del ITESCO y el dominio de Inglés (A través del CLEI) saldrás preparadísimo.`
                ]);
            }
            return "¡Genial! Estudiar en el ITESCO es tu mejor opción tecnológica. ¿Qué área exacta te llama la atención?";
        }
    },
    // 8. ITESCO - Requisitos de Inscripción Exactos (Fijos para no variar)
    {
        pattern: /\b(inscripcion|inscribirme|reinscripcion|reinscribirme|requisito|requisitos|documentos necesito|documentacion|papeles|que ocupo para)\b/i,
        fuzzyKeywords: ["inscripcion", "reinscripcion", "inscribirme", "requisitos", "ingresar", "documentos", "papeles"],
        handler: () => {
             // El usuario pidió que los requisitos "sean los mismos" (no variar la respuesta aleatoriamente), daremos una sola versión exacta:
            return " El requisito indispensable para Nuevo Ingreso en el departamento de Servicios Escolares es presentar de manera presencial:\n1. Certificado de Bachillerato (legalizado)\n2. Acta de Nacimiento original\n3. CURP vigente\n4. Tu número de Alta del Seguro Social (NSS).";
        }
    },
    // 9. ITESCO - Fichas Fechas Especializadas
    {
        pattern: /\b(fecha|fechas|fechas del examen|cuando es|calendario|cuando inicia)\b/i,
        fuzzyKeywords: ["fecha", "fechas", "calendario", "cuando"],
        handler: () => smartRandomChoice([
            " Normalmente el proceso de entrega de fichas de admisión ocurre entre mayo, julio y agosto. El examen presencial y las inscripciones definitivas son en septiembre.",
            "Para no perderte ninguna fecha importante, verifica nuestro calendario oficial en itesco.edu.mx. Tenemos convocatorias en agosto (presencial) y diciembre-enero (línea).",
            "Las fechas de evaluación dependen del calendario federal. Si mantienes vigilado el sitio oficial, no se te pasará tu examen de admisión."
        ])
    },
    // 10. ITESCO - Fichas y Admisión Convocatoria General Enero y Agosto
    {
        pattern: /\b(ficha|fichas|solicitud|admision|examen|quiero entrar|como entro|convocatoria|nuevo ingreso|ingreso)\b/i,
        fuzzyKeywords: ["ficha", "fichas", "solicitud", "admision", "entrar", "examen", "ingreso", "convocatoria"],
        handler: () => smartRandomChoice([
            ` En ITESCO ofrecemos la convocatoria tradicional 'Agosto-Diciembre' para Nuevo Ingreso Presencial. Debes usar la plataforma oficial: <a href="http://sigea.itesco.edu.mx/aspirantes/registro.php" target="_blank" style="color: #007bff; font-weight: bold; text-decoration: underline;">Portal SIGEA (Fichas)</a>.`,
            ` ¡Tenemos novedades! Además del Nuevo Ingreso de Agosto, contamos con Convocatorias para 'Enero'. Revisa el enlace oficial: <br><a href="http://sigea.itesco.edu.mx/aspirantes/registro.php" target="_blank" style="color: #007bff; font-weight: bold; text-decoration: underline;">Obtener mi Ficha Aquí</a>.`,
            `El proceso inicia generando tu ficha de admisión en línea. Hay modalidades Escolarizada, No Escolarizada y a Distancia. Empieza tu trámite aquí: <a href="http://sigea.itesco.edu.mx/aspirantes/registro.php" target="_blank" style="color: #007bff; text-decoration: underline;">Registro de Aspirantes</a>.`,
            `Los pasos base: Ingresar a la liga oficial (<a href="http://sigea.itesco.edu.mx/aspirantes/registro.php" target="_blank" style="color: #007bff; text-decoration: underline;">sigea.itesco.edu.mx</a>), validar tus datos, e imprimir tu línea de captura OVH.`
        ])
    },
    // 11. ITESCO - Carreras Detalles Altamente Variables Y Sub-Intenciones (Materias, Laboral, Conceptos)
    {
        // Regla Maestra Multidimensional: Lee qué buscan (materias, laboral, concepto) y de qué carrera.
        pattern: /\b(materias|reticula|mapa curricular|que se ve|de que trata|que hacen|hacen|en que trabajan|trabajan|campo laboral) (de|en|la|el|las) (.*)\b/i,
        handler: (match) => {
            let intent = match[1].toLowerCase();
            let career = match[3].toLowerCase();

            // 1. Identificar Carrera
            let isSistemas = career.includes("sistema") || career.includes("computacion") || career.includes("software");
            let isMeca = career.includes("meca") || career.includes("robot");
            let isQuimi = career.includes("quimi") || career.includes("bio");
            let isInformatico = career.includes("informa");
            let isAnimacion = career.includes("animaci") || career.includes("digital") || career.includes("efecto");
            let isIndus = career.includes("industrial") || career.includes("procesos");
            let isFerro = career.includes("ferro") || career.includes("tren");
            let isSemi = career.includes("semi") || career.includes("conductor");
            let isElec = career.includes("electri");
            let isElectro = career.includes("electro");
            let isAdmin = career.includes("admin") || career.includes("empresa");
            let isGestion = career.includes("gestion") || career.includes("negocio");

            // 2. Identificar Intención
            let isMaterias = intent.includes("materia") || intent.includes("reticula") || intent.includes("mapa");
            let isQueSeVe = intent.includes("ve") || intent.includes("trata");
            let isQueHacen = intent.includes("hacen") || intent.includes("trabaja") || intent.includes("laboral");

            if (isSistemas) {
                if (isMaterias) return " En Sistemas Computacionales llevarás materias del mapa curricular como: Cálculo Diferencial, Programación Orientada a Objetos, Estructura de Datos, Redes de Computadoras e Inteligencia Artificial.";
                if (isQueSeVe) return " En la carrera de Sistemas se ve todo lo relacionado con la Arquitectura de Computadoras, el desarrollo de Software y la ciberseguridad. Aprenderás a resolver problemas complejos transformándolos en código.";
                if (isQueHacen) return " Un Ingeniero en Sistemas del ITESCO diseña plataformas web, administra bases de datos y suele trabajar como Desarrollador Full-Stack, Arquitecto Cloud o líder de proyectos TI.";
            }
            if (isMeca) {
                if (isMaterias) return " En Mecatrónica cursarás Electromagnetismo, Circuitos Eléctricos, Control Lógico Avanzado (PLCs), Termodinámica y Robótica Industrial.";
                if (isQueSeVe) return " En Mecatrónica se ve la fusión de la electrónica con el control mecánico. Aprenderás instrumentación avanzada para automatizar procesos e integrarlos mediante software.";
                if (isQueHacen) return " Los mecatrónicos suelen dedicarse al mantenimiento industrial, diseño de brazos robóticos y operación de Controladores Numéricos (CNC) en plantas de manufactura pesada.";
            }
            if (isQuimi) {
                if (isMaterias) return " Verás materias como Termodinámica, Cinética Química, Fenómenos de Transporte, Fisicoquímica, Reactores y Procesos de Separación Biológica.";
                if (isQueSeVe) return " Profundizarás en el diseño, control y escalamiento de procesos donde la materia y energía sufren transformaciones a nivel molecular en la industria.";
                if (isQueHacen) return " Son claves en el sector petroquímico y ambiental de la región sur. Controlan refinerías, calidad de alimentos, tratamiento de agua y transformación de polímeros.";
            }
            if (isInformatico) {
                if (isMaterias) return " En Informática estudiarás Auditoría Informática, Administración de Servidores, Arquitectura de Redes y Tecnologías de la Información Dinámicas.";
                if (isQueSeVe) return " Se enfoca más en el soporte, la ciberseguridad corporativa y en administrar centros de cómputo para proteger los datos y la red de hardware completa.";
                if (isQueHacen) return " Laboran como Auditores TI, Administradores de Red (SysAdmins), y soportistas corporativos resguardando la infraestructura en grandes empresas de telecomunicaciones.";
            }
            if (isAnimacion) {
                if (isMaterias) return " Llevarás Dibujo, Modelado Bidimensional y Tridimensional, Animación Gráfica, Programación de Videojuegos, Realidad Aumentada y Motores de Render.";
                if (isQueSeVe) return " Mezcla la creatividad artística con el código puro. Aquí se trata de inventar iluminación digital, físicas, y modelado poligonal para generar experiencias interactivas y visuales.";
                if (isQueHacen) return " Tienen un campo mundial muy atractivo: laboran en estudios de videojuegos (Game Development), agencias publicitarias o aplicando Efectos Visuales (VFX) en casas productoras audiovisuales.";
            }
            if (isIndus) {
                if (isMaterias) return " Las principales asignaturas en Industrial son: Probabilidad Estadística, Ergonomía, Estudio del Trabajo, Sistemas de Manufactura y Control de Calidad ISO.";
                if (isQueSeVe) return " Es la carrera de la 'optimización'. Aquí se trata de planear mejor, usar menos recursos, estructurar la logística y asegurar que una fábrica ahorre dinero produciendo mucho más.";
                if (isQueHacen) return " Trabajan siempre en posiciones de liderazgo: como Supervisores de Piso, Gerentes de Calidad o Jefes de Logística y Cadena de Suministro en terminales portuarias y fábricas corporativas.";
            }
            if (isFerro) {
                if (isMaterias) return " Esta increíble carrera te reta con Vías Férreas, Logística de Transporte Multimodal, Mantenimiento Preventivo de Locomotoras y Mecánica Dinámica Central.";
                if (isQueSeVe) return " Todo gira en torno a la enorme infraestructura de tracción y rieles. Se estudian túneles, balastos, cruces, señalización e incluso la legislación del Corredor Interoceánico.";
                if (isQueHacen) return " Ingresan directamente al ecosistema logístico del Tren Transístmico o el Tren Maya; administrando maniobras, supervisión de carga transnacional y mantenimiento a plataformas ferroviarias pesadas.";
            }
            if (isSemi) {
                if (isMaterias) return " Analizarás semiconductores con asignaturas como Física de Estado Sólido, Diseño Microelectrónico, Fotolitografía, VLSI y Nanotecnología.";
                if (isQueSeVe) return " Se enfoca en la magia microscópica: crear los minúsculos 'chips', procesadores y compuertas lógicas que maneja la electrónica mundial en teléfonos computadoras y electromovilidad.";
                if (isQueHacen) return " Es una carrera del futuro. Se insertan en laboratorios especializados, empresas ensambladoras de silicio, diseño de automatización inteligente y hardware embebido (ARM).";
            }
            if (isElectro || isElec) {
                if (isMaterias) return " Circuitos I y II, Electrónica Analógica y Digital, Máquinas Eléctricas, Control y Microcontroladores, Instalaciones Eléctricas de Alta Potencia.";
                if (isQueSeVe) return " Abarca desde la creación de placas madre y reparación de electrónica hasta la transmisión segura de miles de voltios en subestaciones eléctricas gigantes.";
                if (isQueHacen) return " Su terreno involucra a CFE, Telmex, la Zona Industrial Petroquímica y grandes multinacionales automotrices diseñando tarjetas de componentes e instalaciones eléctricas correctivas y preventivas.";
            }
            if (isGestion || isAdmin) {
                if (isMaterias) return " Tus materias estelares incluirán Contabilidad Financiera, Derecho Laboral, Economía Global, Capital Humano, Innovación de Modelos de Negocios y Matemáticas Financieras.";
                if (isQueSeVe) return " Se ve el funcionamiento real de cómo emprender, sostener o rescatar una empresa: balances de caja, leyes, impuestos, y comportamiento organizacional.";
                if (isQueHacen) return " Toman puestos corporativos como auditores contables, gerentes de nómina, administradores de recursos humanos y analistas financieros en el extranjero o México.";
            }
            
            // Generic fallback si nombra algo que el regex no reconoció limpiamente
            if (isMaterias) return " En esta ingeniería del TecNM cursarás Ciencias Básicas robustas (Cálculos, Físicas) en tus primeros 4 módulos, y luego entrarás de lleno en especialidad de diseño tecnológico.";
            if (isQueSeVe) return " Se ve la capacidad de combinar fórmulas metodológicas para solucionar los dolores locales e internacionales en materia de transformación y tecnología.";
            if (isQueHacen) return " Tendrás las puertas abiertas para dirigir proyectos, fungir como contratista especializado de tu ramo, o escalar al mando directivo dentro del Corredor Interoceánico.";
            
            return "¡Excelente enfoque analítico! Si me confirmas la carrera exacta, te desgloso el campo laboral, las materias detalladas o lo que se ve dentro de la especialidad.";
        }
    },
    // Nuevas Reglas: Información Oficial y Contactos (Datos Verídicos)
    {
        pattern: /\b(pagina oficial|pagina web|sitio web|portal|pagina del itesco|portal del itesco|url)\b/i,
        fuzzyKeywords: ["pagina", "portal", "sitio", "web", "url", "link"],
        handler: () => `Claro, este es el enlace directo a la página oficial de nuestra institución de pagos y noticias: <br><br>👉 <a href="https://itesco.edu.mx/66-2/" target="_blank" style="color: #007bff; font-weight: bold; text-decoration: underline;">Página Oficial del ITESCO</a>`
    },
    {
        pattern: /\b(ubicacion|donde estan|direccion|telefono|contactar|contacto|como llegar|correo|numero)\b/i,
        fuzzyKeywords: ["ubicacion", "donde", "direccion", "telefono", "contactar", "contacto", "llegar", "numero"],
        handler: () => smartRandomChoice([
            `Nos encontramos en el Km. 16.5 de la Carretera Antigua a Minatitlán, C.P. 96536, Coatzacoalcos, Ver. Conmutador central: 921 211 8150.`,
            `Para dudas directas de Servicios Escolares puedes marcar al (921) 211 8151. Nuestras oficinas principales están ubicadas en la carretera rumbo a Canticas.`
        ])
    },
    {
        pattern: /\b(redes sociales|facebook|fb|red social|pagina de facebook|sitio de facebook)\b/i,
        fuzzyKeywords: ["redes", "facebook", "fb", "sociales"],
        handler: () => smartRandomChoice([
            `Síguenos en nuestra Fanpage para no perderte convocatorias ni comunicados: <br><a href="https://www.facebook.com/ITESCOOFICIAL/" target="_blank" style="color: #007bff; font-weight: bold; text-decoration: underline;">ITESCO en Facebook</a>`,
            `Nuestra principal red oficial es Facebook. Puedes escribirnos por ahí o revisar nuestras actualizaciones dando clic aquí: <br><a href="https://www.facebook.com/ITESCOOFICIAL/" target="_blank" style="color: #007bff; font-weight: bold; text-decoration: underline;">Página de Facebook</a>`
        ])
    },
    {
        pattern: /\b(director|directora|rector|rectora|dirige|quien manda|titular)\b/i,
        fuzzyKeywords: ["directora", "director", "rector", "titular", "jefe"],
        handler: () => "La actual Directora General del Instituto Tecnológico Superior de Coatzacoalcos es la maestra Alicia Enriqueta Pérez Yebra, quien coordina e impulsa a la gran comunidad tecnológica de la zona sur."
    },
    // Respuestas Generales de Carreras (Si solo menciona el nombre de la carrera sin contexto de qué busca)
    {
        pattern: /\b(sistemas|computacionales|programacion|software|computacion|sistemas computacionales)\b/i,
        fuzzyKeywords: ["sistemas", "programacion", "software", "computacionales", "computacion", "algoritmos"],
        handler: () => smartRandomChoice([
            " Ingeniería en Sistemas abarca estructura de datos, bases de datos relacionales, backend, frontend e inteligencia artificial. ¡Excelente opción tecnológica!",
            "En la carrera de Sistemas te adentrarás en la Arquitectura de Computadoras, Redes Híbridas y la Programación Orientada a Objetos.",
            "Software puro y duro. Aprenderás a diseñar herramientas tecnológicas, dar mantenimiento analítico de servidores y dominarás lenguajes de alto nivel.",
            "🚀 Sistemas se enfoca en resolver problemas con código analítico. (Para saber más pregúntame: 'qué materias se ven en sistemas' o 'qué hacen en sistemas')"
        ])
    },
    {
        pattern: /\b(mecatronica|robotica|automatizacion)\b/i,
        fuzzyKeywords: ["mecatronica", "robotica", "automatizacion", "robots"],
        handler: () => smartRandomChoice([
            " La Ingeniería Mecatrónica en el Tec fusiona la inteligencia del software con mecanismos industriales. ¡Tendrás amplio contacto con PLCs y control analógico!",
            "Con Mecatrónica aprenderás a diseñar e implementar robots. Es una maestría entre electrónica, mecánica y control aplicable a la enorme zona industrial de la región.",
            "Entrar a Mecatrónica significa sumergirte en manufactura, neumática, automatización industrial e instrumentación de alto nivel. Una carrera para apasionados por el hardware rudo y preciso.",
            "En nuestros laboratorios pesados, los mecatrónicos del ITESCO arman brazos robóticos y programan tarjetas de control CNC de ultimísima generación."
        ])
    },
    {
        pattern: /\b(quimica|petroquimica|bioquimica)\b/i,
        fuzzyKeywords: ["quimica", "petroquimica", "bioquimica", "laboratorio"],
        handler: () => smartRandomChoice([
            " Ya sea Ingeniería Química o Bioquímica, vas a liderar transformaciones y análisis físicos. Las materias núcleo: Termodinámica, Cinética y Reactores.",
            "En el área Química/Bioquímica, entenderás procesos moleculares en laboratorios y su escalado a refinerías o plantas de procesamiento alimentario/petroquímico.",
            "¿Te apasionan los compuestos? Aquí la termodinámica y el control de procesos químicos son tu pan de cada día, orientándote masivamente a la industria de Coatzacoalcos.",
            "Ambas ingenierías (Química y Bioquímica) te instruyen en fenómenos de transporte, cálculo de reactores y uso analítico de instrumentación en el laboratorio."
        ])
    },
    {
        pattern: /\b(administracion|finanzas|empresas|administrar|gestion empresarial|gestion)\b/i,
        fuzzyKeywords: ["administracion", "finanzas", "empresas", "gestion", "contabilidad"],
        handler: () => smartRandomChoice([
            " La Licenciatura en Administración o Ingeniería en Gestión Empresarial te formarán como directivo capaz, dominando economía, contabilidad y capital humano.",
            "Si escoges el área de Gestión Empresarial o Administración, serás un líder innato preparado para crear modelos de negocios innovadores en México.",
            "Nuestro departamento de Administración instruye a los alumnos sobre análisis contable, derecho laboral, estrategias de mercadotécnia y alta dirección corporativa.",
            "Las ramas de Negocios en el ITESCO (Administración y GE) priorizan la innovación financiera, estudios de mercado y el manejo magistral de departamentos corporativos a nivel internacional."
        ])
    },
    {
        pattern: /\b(animacion|digital|efectos|visuales|videojuegos|modelado|renders)\b/i,
        fuzzyKeywords: ["animacion", "digital", "efectos", "visuales", "videojuegos", "renders"],
        handler: () => smartRandomChoice([
            " ¡Aplastando barreras! La Ingeniería en Animación Digital y Efectos Visuales es la joya para los creativos. Aprenderás modelado 3D, post-producción, diseño de interfaces y captura de movimiento.",
            "En Animación Digital vivirás entre software de renderizado, creación de Assets para videojuegos, VFX e iluminación virtual. Su campo de acción en el entretenimiento es masivo.",
            "Creatividad e Ingeniería puras. Vas a aprender rigging, shaders, producción audiovisual y hasta el detrás de escena de las grandes firmas de animación computarizada."
        ])
    },
    {
        pattern: /\b(semiconductores|electronica|electrica|circuitos|tarjetas)\b/i,
        fuzzyKeywords: ["semiconductores", "electronica", "electrica", "circuitos", "tarjetas"],
        handler: () => smartRandomChoice([
            " Para carreras clave como Ingeniería en Semiconductores, Electrónica o Eléctrica, nuestro enfoque radica en microcontroladores, transmisión de potencia y nanotecnología esencial para el Corredor Transístmico.",
            "La Ingeniería en Semiconductores recién añadida, con la Eléctrica y Electrónica, te enseñan la creación y diseño físico de chips, automatización pura y control de calidad electrónica profunda.",
            "Son áreas vitales de innovación mundial. Soldarás microcircuitos, diseñarás prototipos con FPGAs y entenderás todo desde el flujo de corriente hasta sistemas incrustados (embedded)."
        ])
    },
    {
        pattern: /\b(ferroviaria|ferrocarril|industrial|industria|procesos|logistica)\b/i,
        fuzzyKeywords: ["ferroviaria", "ferrocarril", "industrial", "logistica", "trenes"],
        handler: () => smartRandomChoice([
            " La novedosa Ingeniería Ferroviaria y la estelar Ingeniería Industrial brillan por su inmenso marco logístico. Verás cadena de suministros, mantenimiento de rieles/maquinaria y control de tiempos.",
            "Industrial se inclina por calidad ISO y procesos óptimos, mientras Ferroviaria es nuestra apuesta estrella con el megaproyecto nacional. Su enfoque logístico es ultra especializado.",
            "Tanto Industrial como Ferroviaria se apoyan del dibujo técnico, la economía de materiales, manufactura integrada y seguridad laboral industrial. ¡Bolsa de trabajo internacional!"
        ])
    },
    // 12. ITESCO - Trámites Extra y Departamentos
    {
        pattern: /\b(beca|becas|apoyo|ayuda economica)\b/i,
        fuzzyKeywords: ["beca", "becas", "apoyo", "economico", "federal", "subes"],
        handler: () => smartRandomChoice([
            "El departamento de Finanzas o de Vinculación asiste con la Beca Jóvenes Escribiendo el Futuro. Se gestiona desde Subes en las fechas de gobierno federal.",
            "¡El Tec te orienta! Tenemos un área dedicada al enlace de becas federales. Mantente pendiente de las convocatorias emitidas desde el portal del Bienestar para aplicar a tu subsidio económico escolar.",
            "En ITESCO apoyamos tu postulación a becas federales desde que eres inscrito definitivo. Se emite tu validación en plataforma y tú te integras al fideicomiso del gobierno."
        ])
    },
    {
        pattern: /\b(ingles|clei|idioma|idiomas|lenguas|extranjeras)\b/i,
        fuzzyKeywords: ["ingles", "clei", "idioma", "idiomas", "lenguas", "extranjeras"],
        handler: () => smartRandomChoice([
            " A través de la Coordinación de Lenguas Extranjeras (CLEI) acreditas tu nivel de inglés internamente. Es importantísimo ya que es requisito mandatorio para titulación.",
            "Tenemos el 'CLEI' y el 'Sistema Abierto' de la red, puedes estudiar módulos de inglés presenciales. Recuerda liberar los 6 niveles básicos obligatorios antes de cursar residencias.",
            "Dominio de idioma y titulación van de la mano. CLEI te orienta en niveles y el proceso TOEFL. Siempre debes estar pendiente en su página de inscripciones en cada semestre."
        ])
    },
    {
        pattern: /\b(titulacion|titularme|titulo|egresar|ceneval|residencias)\b/i,
        fuzzyKeywords: ["titulacion", "titularme", "titulo", "egresar", "egreso", "ceneval", "residencias", "egel"],
        handler: () => smartRandomChoice([
            " Entrar es el inicio, Egresar una victoria. Para solicitar inicio de Titulación ocupas liberar: Servicio Social, Residencias Profesionales y Cursos CLEI (inglés).",
            "¿Opciones de titulación? Tenemos EGEL (por CENEVAL), Titulación por alto promedio y memoria/tesis. Trátalo directo con el jefe de la división de tu ingeniería al final del ciclo.",
            "El camino a la cédula profesional ITESCO demanda primero tus acreditaciones extraescolares listas, tu servicio social validado y el proyecto avalado de tus Estadías o Residencias."
        ])
    },
    // 13. Agradecimientos y Cierre
    {
        pattern: /\b(gracias|muchas gracias|te lo agradezco|perfecto|ok|vale|entendido|va|esta bien|comprendo)\b/i,
        fuzzyKeywords: ["gracias", "ok", "vale", "entendido", "perfecto", "comprendo"],
        handler: () => {
            const thanksResponses = [
                "¡Para servirte!", 
                "¡Es un verdadero placer ayudar!", 
                "¡Excelente! Cualquier otra duda, aquí ando prestando mi interfaz.", 
                "¡Quedo a tu total disposición digital!",
                "¡Mucho éxito en todo lo relacionado al Tec!"
            ];
            return (memory.userName ? `${smartRandomChoice(thanksResponses)} ¡Un fuerte abrazo, ${memory.userName}!` : smartRandomChoice(thanksResponses));
        }
    },
    {
        pattern: /\b(adios|hasta luego|bye|nos vemos|despedida|chao)\b/i,
        fuzzyKeywords: ["adios", "bye", "chao", "luego", "despedida"],
        handler: () => smartRandomChoice([
            `¡Nos vemos muy pronto${memory.userName ? ' ' + memory.userName : ''}! Que la excelencia académica guíe tu camino. `,
            "¡Hasta luego! Presiona la (X) para ocultarme en el rincón y yo me quedaré monitoreando los servidores institucionales.",
            "¡Chao! Vuelve a consultarme cuando quieras reportes oficiales o fechas actualizadas.",
            "¡Excelente día! Me desconecto de momento para indexar datos del Tec, ¡pero puedes activarme de nuevo cuando decidas!"
        ])
    }
];

// Fallbacks de incomprensión más robustos y realistas, atados a smartRandomChoice igual
const fallbackResponses = [
    "Hmm... mi sistema virtual está experimentando ligeros problemas semánticos con esa frase.  ¿Podrías replantearlo utilizando palabras más clave sobre carreras tecnológicas, inglés o admisiones?",
    "Entiendo ciertas palabras, pero mi base de datos cognitiva está enfocada al 100% en temas operativos del ITESCO. ¿Tienes alguna pregunta sobre el proceso de becas, inscripciones o GE?",
    "¡Ups, eso definitivamente me agarró fuera de mi matriz de conocimiento!  Intentemos de nuevo: ¿hay información de alguna ingeniería, fechas de CENEVAL o CLEI que desees revisar?",
    "A veces los algoritmos fallamos un poco integrando un contexto abstracto. ¿Te parece si abordamos dudas orientadas a la ficha, sistema de residencias o a alguna licenciatura?",
    "Interesante postura humana, aunque carezco de los módulos para interpretarlo correctamente.  Mi memoria ROM se ocupa sólo del Tecnológico. ¿Te informo de la modalidad 'A distancia'?",
    "Disculpa la interrupción en mi hilo lógico. ¿Querías consultar algo sobre Sistemas, Mecatrónica, Bioquímica, o los requisitos oficiales?"
];

// --- FUNCIONES DE COMUNICACIÓN Y UI ---

// Función para enviar mensaje tipeado
function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;
    
    appendMessage(text, "wrapper-user");
    userInput.value = "";
    
    // Iniciar el efecto de simulación cognitiva de procesamiento natural
    simulateCognitiveProcess(text);
}

// Función para los botones rápidos
function sendQuickReply(text) {
    appendMessage(text, "wrapper-user");
    simulateCognitiveProcess(text);
}

// Algoritmo base para procesado semántico-difuso (Test de Turing Pasado)
function simulateCognitiveProcess(userText) {
    let rawText = userText;
    let lowerText = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,;(){}\[\]"']/g, ""); 
    
    let botResponse = null;

    // 1. Análisis Estructural Profundo por Expresiones Regulares
    for (let rule of knowledgeBase) {
        if (rule.pattern) {
            let match = rawText.match(rule.pattern) || lowerText.match(rule.pattern);
            if (match) {
                botResponse = rule.handler(match);
                break; 
            }
        }
    }

    // 2. Extracción Semántica por Subcadena (Fuzzy Overlap Machine Learning ligero)
    if (!botResponse) {
        let userWords = lowerText.split(/\s+/).filter(w => w.length > 2);
        let bestFuzzyRule = null;
        let highestOverlap = 0;

        for (let rule of knowledgeBase) {
            if (rule.fuzzyKeywords) {
                let overlap = 0;
                for (let word of userWords) {
                    for (let kw of rule.fuzzyKeywords) {
                        // Bonus matemático para matches literales (evita hijack de substrings débiles)
                        if (word === kw) overlap += 2;
                        else if (kw.includes(word) || word.includes(kw)) overlap += 1;
                    }
                }
                if (overlap > highestOverlap) {
                    highestOverlap = overlap;
                    bestFuzzyRule = rule;
                }
            }
        }

        if (bestFuzzyRule && highestOverlap > 0) {
            let fakeMatch = ["", ""]; // Mock para fallbacks de handlers con grupos capturing
            botResponse = bestFuzzyRule.handler(fakeMatch);
        }
    }

    // 3. Mecanismo Defensivo (Manejo Dinámico de Ambigüedades con Retención de Contexto)
    if (!botResponse) {
        memory.consecutiveFails++;
        if (memory.consecutiveFails >= 2) {
            // Fuerza pidiendo clarificación y resetea ciclo
            botResponse = "De acuerdo... llevo un par de intentos fallidos de encriptar el sentido original de lo que señalas. Te lo resumo en opciones: ¿Hablamos de [Inscripciones], [Nuestras 11 Ingenierías], [Inglés CLEI] o el [Calendario]?";
            memory.consecutiveFails = 0;
        } else {
            botResponse = smartRandomChoice(fallbackResponses);
        }
    } else {
        memory.consecutiveFails = 0; 
    }

    // Calcular el retraso humano a la hora de procesar, tipear y despachar (entre 0.8s y 1.6s iniciales)
    let thinkingDelay = 800 + Math.random() * 800;
    let talkId = startTalkingAnimation();

    setTimeout(() => {
        // Enviar respuesta oficial con inyección visual
        appendMessage(botResponse, "wrapper-bot");
        
        // Simular latencia de mecanografiado basada en volumen de texto renderizado
        let typingDuration = Math.min(botResponse.length * 28, 3800); 
        setTimeout(() => stopTalkingAnimation(talkId), typingDuration);
    }, thinkingDelay);
}

// Dibuja el mensaje literal en la pantalla de chat visual
function appendMessage(text, wrapperClass) {
    if(!messageList) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper ${wrapperClass}`;
    
    // Animación de entrada
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(10px) scale(0.95)';
    wrapper.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    
    let bubbleClass = wrapperClass === "wrapper-bot" ? "bot-msg" : "user-msg";
    let badgeHtml = wrapperClass === "wrapper-bot" ? `<div class="bot-badge">Asistente IA Avanzado</div>` : "";
    
    // Formatear retornos de carro en \n a <br>
    let formattedText = text.replace(/\n/g, '<br>');

    wrapper.innerHTML = `
        <div class="message ${bubbleClass}">
            ${badgeHtml}
            ${formattedText}
        </div>
        <div class="msg-time">${time}</div>
    `;
    
    messageList.appendChild(wrapper);
    
    requestAnimationFrame(() => {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'translateY(0) scale(1)';
        messageList.scrollTop = messageList.scrollHeight; // Auto-scroll smooth
    });
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// --- MOTOR DE ANIMACIÓN DE JAGUARUNDI ---

function startTalkingAnimation() {
    if(!mascotImage) return null;
    let frame = 1;
    talkInterval = setInterval(() => {
        mascotImage.src = frame === 1 ? IMG_TALK1 : IMG_TALK2;
        frame = frame === 1 ? 2 : 1;
    }, 150); 
    
    mascotImage.style.transform = 'scale(1.02)';
    return talkInterval;
}

function stopTalkingAnimation(intervalId) {
    if(intervalId) clearInterval(intervalId);
    if(!mascotImage) return;
    mascotImage.src = IMG_BASE;
    mascotImage.style.transform = 'scale(1)';
}
