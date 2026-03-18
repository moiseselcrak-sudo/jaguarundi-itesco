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
    greetings: 0,
    howAreYou: 0
};

// --- BASE DE CONOCIMIENTO (Reglas, Patrones y Handlers de NLP) ---
const knowledgeBase = [
    {
        keywords: ["hola", "buenos dias", "buenas tardes", "buenas noches", "saludos", "hey", "que onda", "holi"],
        handler: () => {
            memory.greetings++;
            if (memory.greetings === 1) {
                return "¡Hola! Qué gusto saludarte. Soy Jaguarundi, tu Agente Inteligente. ¿Tienes dudas sobre requisitos o algún trámite de inscripción en ITESCO?";
            } else {
                return "¡Hola otra vez! ¡Qué excelente estoy para atenderte! Dime, ¿en qué más te puedo apoyar hoy? 😊";
            }
        }
    },
    {
        keywords: ["como estas", "que tal", "como te va", "como andas", "como te sientes"],
        handler: () => {
            memory.howAreYou++;
            return "¡Muy bien! Gracias por preguntar. ¿Y tú, qué necesitas esta vez? Estoy listo para darte la mejor asesoría en tus procesos escolares.";
        }
    },
    {
        keywords: ["quien eres", "que eres", "como te llamas", "cual es tu nombre", "eres un bot", "eres una ia", "inteligencia artificial"],
        response: "Soy <b>Jaguarundi</b>, un Agente Inteligente Conversacional 🤖 especializado en los procesos del Tecnológico (ITESCO). Mi base de conocimiento me permite ayudarte de forma rápida y eficiente. 🐾"
    },
    {
        keywords: ["gracias", "muchas gracias", "te lo agradezco", "excelente", "perfecto", "ok", "vale", "entendido"],
        response: "¡Para eso estoy! Ha sido un placer. Si en algún otro momento necesitas ayuda, aquí seguiré para ti. ¡Mucho éxito en tu carrera! 🚀"
    },
    {
        keywords: ["donde busco", "donde encuentro", "pagina", "link", "enlace", "sitio web", "portal", "donde me inscribo", "como me inscribo", "informacion", "convocatoria"],
        response: "🌐 Toda la información oficial, las convocatorias vigentes y la plataforma para tramitar tu ficha de nuevo ingreso la encuentras en nuestro portal web: <br><br>👉 <a href='https://www.itesco.edu.mx/' target='_blank' style='color: #d35400; font-weight: bold; text-decoration: none;'>Portal Oficial ITESCO</a><br>👉 <a href='http://fichas.itesco.edu.mx/' target='_blank' style='color: #d35400; font-weight: bold; text-decoration: none;'>Plataforma de Fichas (Aspirantes)</a>"
    },
    {
        keywords: ["inscripcion", "inscribirme", "inscribir", "nuevo ingreso", "requisitos"],
        response: "✅ ¡Perfecto! Para la inscripción de <b>Nuevo Ingreso</b> requieres:<br><ul style='margin-left: 20px; margin-top: 10px;'><li>Acta de Nacimiento Original y copia.</li><li>CURP actualizado.</li><li>Certificado de Bachillerato.</li><li>Número de Seguridad Social (NSS) validado.</li><li>2 Fotografías tamaño infantil.</li></ul><br>Recuerda que las fechas de <b>Inscripciones oficiales son el 1 de septiembre</b>."
    },
    {
        keywords: ["convalidacion", "reingreso", "traslado", "equivalencia", "villahermosa", "cambio de escuela"],
        response: "¡Entendido perfectamente! Para tu caso, el proceso es la <b>Convalidación de Estudios</b>. Pide en tu instituto de origen:<br><ul style='margin-left: 20px; margin-top: 10px;'><li>Oficio de No Adeudo.</li><li>Certificado Parcial.</li><li>Programas de Estudio sellados de todas tus materias.</li></ul><br>Debes llevarlos a tu Jefatura de Carrera aquí. ¡Consúltalo primero con el Coordinador de Carrera antes de pagar en caja!"
    },
    {
        keywords: ["beca", "becas", "apoyo", "ayuda economica"],
        response: "En apoyos, manejamos la <b>Beca Jóvenes Escribiendo el Futuro / Benito Juárez</b>. Es a nivel federal por la plataforma Subes, pero en Coordinación de Servicios Escolares te orientamos en las fechas de registro institucionales."
    },
    {
        keywords: ["titulacion", "titularme", "titulo", "egresado", "pasante"],
        response: "🎓 Para la <b>Titulación</b> debes liberar: 1. Servicio Social, 2. Residencias Profesionales y 3. Nivel de Inglés. Contamos con modalidades como: Tesis, CENEVAL (EGEL), Curso de Especialización o Promedio. ¡Anímate, estás a un paso!"
    },
    {
        keywords: ["horario", "horarios", "a que hora", "abren", "cierran", "atencion"],
        response: "📅 Las ventanillas de Servicios Escolares y Cajas Financieras atienden generalmente de <b>Lunes a Viernes de 9:00 a.m. a 5:00 p.m.</b>. ¡Te sugiero siempre llegar con tiempo de anticipación!"
    },
    {
        keywords: ["carrera", "carreras", "ingenieria", "licenciatura", "oferta", "estudiar"],
        response: "Contamos con una excelente oferta académica: Ingenierías en Sistemas Computacionales, Mecatrónica, Química, Industrial, Bioquímica, Electrónica, Informática, Mecánica y la Licenciatura en Administración. ¿Sobre cuál te gustaría saber qué materias llevarás?"
    },
    {
        keywords: ["sistemas", "sistemas computacionales", "programacion", "software", "computacion", "computadoras"],
        response: "💻 En <b>Ingeniería en Sistemas Computacionales</b> aprenderás a crear software y aplicaciones desde cero aplicándolo de forma práctica. Según nuestra retícula del TecNM, verás materias como: <b>Programación Orientada a Objetos, Redes de Computadoras, Bases de Datos, y Tópicos Avanzados de Programación</b>. Actualmente nos especializamos en Seguridad en la Nube y Ciberseguridad."
    },
    {
        keywords: ["mecatronica", "robotica", "automatizacion"],
        response: "🤖 En <b>Ingeniería Mecatrónica</b> aprenderás a diseñar y armar robots o sistemas automatizados en el taller. Siguiendo el plan del TecNM, aprobarás ramas como: <b>Controladores Lógicos Programables (PLC), Electromagnetismo, Dinámica de Sistemas y Robótica</b>."
    },
    {
        keywords: ["quimica", "petroquimica"],
        response: "🧪 En <b>Ingeniería Química</b> te enseñarán a transformar materias a gran escala haciendo prácticas en laboratorios pesados. Nuestro plan del TecNM incluye materias críticas como: <b>Termodinámica, Reactores Químicos, y Fenómenos de Transporte</b>. Nos enfocamos en Procesos Petroquímicos y Ambientales."
    },
    {
        keywords: ["industrial", "manufactura", "calidad", "procesos"],
        response: "⚙️ En <b>Ingeniería Industrial</b> aprenderás a optimizar empresas (Manufactura y Control de Calidad). Entre las materias clave de la retícula del TecNM están: <b>Estudio del Trabajo, Investigación de Operaciones, Logística y Cadenas de Suministro, e Ingeniería Económica</b>."
    },
    {
        keywords: ["administracion", "empresas", "rh", "recursos humanos"],
        response: "📊 En la <b>Licenciatura en Administración</b> aprenderás a dirigir y organizar empresas dominando materias del TecNM como: <b>Mercadotecnia, Finanzas en las Organizaciones, Comportamiento Organizacional, y Desarrollo de Capital Humano</b>."
    },
    {
        keywords: ["materias", "reticula", "plan de estudios", "mapa curricular", "semestres"],
        response: "📚 El <b>Plan de Estudios</b> oficial dura 9 semestres. Los primeros semestres abordan las Ciencias Básicas (Cálculo, Física, Álgebra). A partir del 6to y 7mo semestre te adentras en las materias del <b>Módulo de Especialidad</b> propias de tu carrera."
    },
    {
        keywords: ["paso", "pasos", "como sacar", "sacar ficha", "sacar fichas", "como saco", "como tramito", "como solicito", "proceso ficha", "obtener ficha", "como obtengo", "tramite de ficha"],
        response: "📝 <b>Pasos para sacar tu Ficha:</b><br><ol style='margin-left: 20px; margin-top: 10px;'><li>Entra a <b>fichas.itesco.edu.mx</b>.</li><li>Ingresa tu CURP y llena la solicitud.</li><li>Contesta el cuestionario socioeconómico (CENEVAL).</li><li>Imprime tu formato de pago (OVH) y págalo en el banco o tienda.</li><li>Sube tu comprobante validado al sistema para obtener tu ficha final y tu guía de estudio.</li></ol>"
    },
    {
        keywords: ["fecha", "fechas", "cuando es", "calendario", "dias", "examen", "admision", "ceneval", "ficha", "fichas"],
        response: "📅 Sobre el proceso de admisión, estas son las fechas clave más recientes:<br>📝 <b>Trámite de Fichas:</b> 19 al 27 de agosto.<br>🧠 <b>Examen de Admisión:</b> 29 de agosto.<br>✅ <b>Inscripciones:</b> 1 de septiembre.<br><br>⚠️ <b>Prórroga: a espera.</b> Mantente alerta en nuestras redes oficiales para cualquier novedad."
    },
    {
        keywords: ["servicio social", "servicio", "liberar servicio"],
        response: "El <b>Servicio Social</b> requiere que alcances el 70% de tus créditos de la retícula. Comprende 500 horas de actividades en un plazo de entre 6 meses a 2 años. Iniciarás asistiendo a las pláticas de inducción del departamento de Gestión Tecnológica y Vinculación."
    },
    {
        keywords: ["residencia", "residencias", "practicas profesionales"],
        response: "🏭 Para <b>Residencias Profesionales</b> ocupas tener el 80% de créditos aprobados y servicio social liberado. Duran de 4 a 6 meses para un acumulado de 500 horas elaborando un proyecto funcional en una empresa real o en estadías."
    },
    {
        keywords: ["ingles", "idiomas", "cle", "lenguas"],
        response: "🌎 El inglés es fundamental. Requieres cursar 5 niveles en la Coordinación de Lenguas Extranjeras (CLE) del instituto. Puedes aplicar examen de colocación al inicio de semestre."
    },
    {
        keywords: ["bioquimica", "alimentos", "biologia"],
        response: "🧬 En <b>Ingeniería Bioquímica</b> (plan TecNM) aprenderás a transformar recursos biológicos. Verás materias clave como: <b>Microbiología, Operaciones Unitarias, Bioquímica del Nitrógeno y Tecnología de Alimentos</b>."
    },
    {
        keywords: ["electronica", "circuitos", "microcontroladores"],
        response: "⚡ En <b>Ingeniería Electrónica</b> dominarás el diseño de hardware. El TecNM incluye materias como: <b>Diseño Digital, Microcontroladores, Optoelectrónica y Control Automático</b>."
    },
    {
        keywords: ["informatica", "redes", "auditoria"],
        response: "🖥️ La <b>Ingeniería Informática</b> se enfoca en administrar e implementar redes y sistemas tecnológicos. Verás: <b>Arquitectura de Computadoras, Auditoría Informática, Interconectividad de Redes y Tecnologías Web</b>."
    },
    {
        keywords: ["mecanica", "termodinamica", "diseño mecanico"],
        response: "⚙️ En <b>Ingeniería Mecánica</b> aprenderás sobre automatización y termofluidos. Cursarás materias como: <b>Mecánica de Materiales, Termodinámica, Diseño Mecánico y Máquinas de Fluidos</b>."
    },
    {
        keywords: ["creditos", "complementarios", "extraescolares", "deporte", "cultura"],
        response: "🏀 Para egresar necesitas liberar <b>5 Créditos Complementarios</b>. Los obtienes participando en actividades Extraescolares (Deportes, Escoltas, Arte), asistiendo a Congresos o mediante el sistema de Tutorías."
    },
    {
        keywords: ["dual", "modelo dual", "educacion dual"],
        response: "🤝 El <b>Modelo de Educación Dual</b> del TecNM te permite cursar tu último trayecto de la carrera directamente dentro de una empresa vinculada, combinando la teoría del aula con la experiencia laboral real desde antes de egresar."
    },
    {
        keywords: ["historia", "que es itesco", "mision", "vision"],
        response: "🏛️ El <b>ITESCO</b> (Instituto Tecnológico Superior de Coatzacoalcos) es la máxima casa de estudios tecnológicos del sur de Veracruz y forma parte del gran orgullo <b>Tecnológico Nacional de México (TecNM)</b>. Nuestra misión es formar ingenieros líderes con espíritu innovador y calidad humana."
    },
    {
        keywords: ["chiste", "broma", "cuentame algo", "aburrido", "no se que decir", "chistoso"],
        response: "¡Jeje! 😸 Soy mejor dando asesoría escolar que contando chistes, pero intentaré: ¿Qué hace una computadora cuando tiene calor? ... ¡Abre una ventana! 🪟 Dime, ¿qué carrera te llama la atención estudiar con nosotros?"
    },
    {
        keywords: ["adios", "hasta luego", "bye", "nos vemos", "despedida", "chao"],
        response: "¡Hasta pronto, futuro ingeniero Que la fuerza de nuestro orgullo jaguar te acompañe. ¡Nos vemos por los pasillos del ITESCO! 🐾"
    }
];

// --- FUNCIONES DE COMUNICACIÓN Y UI ---

// Función para enviar mensaje tipeado
function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;
    
    appendMessage(text, "wrapper-user");
    userInput.value = "";
    
    processNLP(text);
}

// Función para los botones rápidos
function sendQuickReply(text) {
    appendMessage(text, "wrapper-user");
    processNLP(text);
}

// Función que dibuja el mensaje en la pantalla de chat
function appendMessage(text, wrapperClass) {
    if(!messageList) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper ${wrapperClass}`;
    
    // Animación de entrada
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(10px) scale(0.95)';
    wrapper.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    
    let bubbleClass = wrapperClass === "wrapper-bot" ? "bot-msg" : "user-msg";
    let badgeHtml = wrapperClass === "wrapper-bot" ? `<div class="bot-badge">🌟 Especialista en Inscripciones</div>` : "";
    
    wrapper.innerHTML = `
        <div class="message ${bubbleClass}">
            ${badgeHtml}
            ${text}
        </div>
        <div class="msg-time">${time}</div>
    `;
    
    messageList.appendChild(wrapper);
    
    // Trigger animación (requestAnimationFrame es para que el DOM se entere que se pintó 0 opacity antes de transicionar)
    requestAnimationFrame(() => {
        wrapper.style.opacity = '1';
        wrapper.style.transform = 'translateY(0) scale(1)';
        messageList.scrollTop = messageList.scrollHeight; // Auto-scroll
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
    
    // Añadir leve vibración CSS para simular que está vivo
    mascotImage.style.transform = 'scale(1.02)';
    
    return talkInterval;
}

function stopTalkingAnimation(intervalId) {
    if(intervalId) clearInterval(intervalId);
    if(!mascotImage) return;
    mascotImage.src = IMG_BASE;
    mascotImage.style.transform = 'scale(1)';
}

// --- EL "CEREBRO": Inteligencia Computacional y Procesamiento de Lenguaje Natural ---
function processNLP(text) {
    let lowerText = text.toLowerCase();
    
    // Normalización avanzada: Quitar acentos, diéresis y cualquier signo de puntuación perturbador
    lowerText = lowerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,;(){}\[\]"']/g, ""); 
    
    // Respuesta por defecto con personalidad si no hay coincidencias
    let botResponse = "Hmmm, ¡qué interesante! 🤔 Aunque como Inteligencia Artificial del ITESCO, mi red neuronal no cubre eso. Pregúntame sobre el plan de estudios, carreras como Sistemas y Mecatrónica, fechas de examen, inscripciones o titulaciones y te daré detalles precisos.";

    // Inferencia heurística de coincidencia de palabras clave
    for (let rule of knowledgeBase) {
        let match = rule.keywords.some(keyword => {
            // Buscamos que encaje la frase exacta suelta o dentro del string
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return regex.test(lowerText) || lowerText.includes(keyword);
        });
        
        if (match) {
            // Evaluamos si usamos función anónima con memoria contextual o el string directo
            if (typeof rule.handler === 'function') {
                botResponse = rule.handler(); 
            } else {
                botResponse = rule.response;
            }
            break; 
        }
    }

    // Animación y Simulación de Latencia natural (no inmediata)
    let talkId = startTalkingAnimation();
    
    // Generar la burbuja temporal de "Jaguarundi escribiendo..."
    // Se podría añadir un indicador visual, pero usaremos el retraso para simularlo
    setTimeout(() => {
        appendMessage(botResponse, "wrapper-bot");
    }, 900); // 0.9s de "razonar y escribir"
    
    // Calculo heurístico del tiempo que se tarda en hablar toda la oración
    let talkDuration = 900 + Math.min(botResponse.length * 35, 4500); 
    
    setTimeout(() => {
        stopTalkingAnimation(talkId);
    }, talkDuration);
}
