// Configuración del horario
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Configuración por defecto
let scheduleConfig = {
    startHour: 8,
    totalHours: 8,
    breaks: [] // Array de objetos {hour: '10:00', name: 'Recreo'}
};

// Cargar configuración guardada
function loadConfig() {
    const saved = localStorage.getItem('scheduleConfig');
    if (saved) {
        scheduleConfig = JSON.parse(saved);
    }
}

// Guardar configuración
function saveConfig() {
    localStorage.setItem('scheduleConfig', JSON.stringify(scheduleConfig));
}

// Generar array de horas basado en configuración
function generateHours() {
    const hours = [];
    for (let i = 0; i < scheduleConfig.totalHours; i++) {
        const hour = scheduleConfig.startHour + i;
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        
        // Verificar si esta hora es un recreo
        const breakInfo = scheduleConfig.breaks.find(b => b.hour === timeString);
        if (breakInfo) {
            hours.push({ time: timeString, isBreak: true, name: breakInfo.name });
        } else {
            hours.push({ time: timeString, isBreak: false });
        }
    }
    return hours;
}

// Función para generar colores únicos para cada materia
function getSubjectColor(subject) {
    if (!subject || subject.trim() === '') return '#f8f9fa';
    
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// Función para generar el horario
function generateSchedule() {
    const container = document.getElementById('schedule-container');
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear la estructura del horario
    const scheduleGrid = document.createElement('div');
    scheduleGrid.className = 'schedule-grid';
    
    // Crear celda vacía para la esquina superior izquierda
    const emptyCell = document.createElement('div');
    emptyCell.className = 'time-header empty-cell';
    scheduleGrid.appendChild(emptyCell);
    
    // Crear headers de días
    DAYS.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        scheduleGrid.appendChild(dayHeader);
    });
    
    // Generar horas basado en configuración
    const hours = generateHours();
    
    // Crear filas de horarios
    hours.forEach(hourObj => {
        // Header de hora
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        timeHeader.textContent = hourObj.time;
        scheduleGrid.appendChild(timeHeader);
        
        if (hourObj.isBreak) {
            // Crear celda de recreo que ocupa toda la fila
            const breakCell = document.createElement('div');
            breakCell.className = 'schedule-cell break-cell';
            breakCell.style.gridColumn = `2 / ${DAYS.length + 2}`;
            breakCell.dataset.hour = hourObj.time;
            
            // Crear input para el nombre del recreo
            const breakInput = document.createElement('input');
            breakInput.type = 'text';
            breakInput.className = 'break-input';
            breakInput.placeholder = 'Nombre del recreo';
            breakInput.value = hourObj.name || 'Recreo';
            
            // Event listeners para guardar cambios del recreo
            breakInput.addEventListener('blur', () => saveBreakName(hourObj.time, breakInput.value));
            breakInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    breakInput.blur();
                }
            });
            
            breakCell.appendChild(breakInput);
            scheduleGrid.appendChild(breakCell);
        } else {
            // Celdas normales para cada día
            DAYS.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'schedule-cell';
                cell.dataset.day = day;
                cell.dataset.hour = hourObj.time;
                
                // Crear input editable
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'subject-input';
                input.placeholder = 'Materia';
                
                // Cargar contenido guardado
                const savedContent = localStorage.getItem(`schedule_${day}_${hourObj.time}`);
                if (savedContent) {
                    input.value = savedContent;
                    cell.style.backgroundColor = getSubjectColor(savedContent);
                    cell.classList.add('has-subject');
                }
                
                // Event listeners para guardar cambios
                input.addEventListener('blur', () => saveSubject(cell, input));
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        input.blur();
                    }
                });
                
                cell.appendChild(input);
                scheduleGrid.appendChild(cell);
            });
        }
    });
    
    container.appendChild(scheduleGrid);
}

// Función para guardar materia
function saveSubject(cell, input) {
    const day = cell.dataset.day;
    const hour = cell.dataset.hour;
    const subject = input.value.trim();
    
    // Guardar en localStorage
    if (subject) {
        localStorage.setItem(`schedule_${day}_${hour}`, subject);
        cell.style.backgroundColor = getSubjectColor(subject);
        cell.classList.add('has-subject');
    } else {
        localStorage.removeItem(`schedule_${day}_${hour}`);
        cell.style.backgroundColor = '#f8f9fa';
        cell.classList.remove('has-subject');
    }
}

// Función para guardar nombre del recreo
function saveBreakName(hour, name) {
    const breakIndex = scheduleConfig.breaks.findIndex(b => b.hour === hour);
    if (breakIndex !== -1) {
        scheduleConfig.breaks[breakIndex].name = name.trim() || 'Recreo';
        saveConfig();
    }
}

// Función para aplicar configuración
function applyConfig() {
    const startHour = parseInt(document.getElementById('start-hour').value);
    const totalHours = parseInt(document.getElementById('total-hours').value);
    
    scheduleConfig.startHour = startHour;
    scheduleConfig.totalHours = totalHours;
    
    saveConfig();
    generateSchedule();
    
    // Mostrar mensaje de confirmación
    showConfigMessage('Configuración aplicada correctamente');
}

// Función para mostrar mensaje de configuración
function showConfigMessage(message) {
    const button = document.getElementById('apply-config-btn');
    const originalText = button.innerHTML;
    
    button.innerHTML = `<i class="fas fa-check"></i> <span>${message}</span>`;
    button.style.background = 'var(--gradient-success)';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = 'var(--gradient-primary)';
    }, 2000);
}

// Función para agregar recreo
function addBreak() {
    const breakHour = document.getElementById('break-hour').value;
    const breakName = document.getElementById('break-name').value.trim() || 'Recreo';
    
    if (breakHour) {
        // Verificar si ya existe un recreo en esa hora
        const existingBreak = scheduleConfig.breaks.find(b => b.hour === breakHour);
        if (!existingBreak) {
            scheduleConfig.breaks.push({ hour: breakHour, name: breakName });
            saveConfig();
            generateSchedule();
            updateBreaksList();
            
            // Limpiar campos
            document.getElementById('break-hour').value = '';
            document.getElementById('break-name').value = '';
        } else {
            alert('Ya existe un recreo en esa hora');
        }
    }
}

// Función para eliminar recreo
function removeBreak(hour) {
    scheduleConfig.breaks = scheduleConfig.breaks.filter(b => b.hour !== hour);
    saveConfig();
    generateSchedule();
    updateBreaksList();
}

// Función para actualizar lista de recreos
function updateBreaksList() {
    const breaksList = document.getElementById('breaks-list');
    breaksList.innerHTML = '';
    
    scheduleConfig.breaks.forEach(breakInfo => {
        const breakItem = document.createElement('div');
        breakItem.className = 'break-item';
        breakItem.innerHTML = `
            <span>${breakInfo.hour} - ${breakInfo.name}</span>
            <button onclick="removeBreak('${breakInfo.hour}')" class="remove-break-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        breaksList.appendChild(breakItem);
    });
}

// Función para generar opciones de horas para recreos
function generateBreakHourOptions() {
    const select = document.getElementById('break-hour');
    select.innerHTML = '<option value="">Seleccionar hora</option>';
    
    const hours = generateHours();
    hours.forEach(hourObj => {
        if (!hourObj.isBreak) {
            const option = document.createElement('option');
            option.value = hourObj.time;
            option.textContent = hourObj.time;
            select.appendChild(option);
        }
    });
}

// Función para exportar a PNG
function exportToPNG() {
    const scheduleContainer = document.getElementById('schedule-container');
    const exportButton = document.getElementById('export-btn');
    
    // Cambiar texto del botón
    exportButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    exportButton.disabled = true;
    
    // Configuración para html2canvas
    const options = {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: scheduleContainer.scrollWidth,
        height: scheduleContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
    };
    
    html2canvas(scheduleContainer, options).then(canvas => {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.download = 'mi-horario-academico.png';
        link.href = canvas.toDataURL('image/png');
        
        // Simular clic para descargar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Restaurar botón
        exportButton.innerHTML = '<i class="fas fa-download"></i> Exportar PNG';
        exportButton.disabled = false;
    }).catch(error => {
        console.error('Error al exportar:', error);
        alert('Error al generar la imagen. Por favor, inténtalo de nuevo.');
        
        // Restaurar botón
        exportButton.innerHTML = '<i class="fas fa-download"></i> Exportar PNG';
        exportButton.disabled = false;
    });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    generateSchedule();
    updateBreaksList();
    
    // Configurar valores iniciales en el panel de configuración
    document.getElementById('start-hour').value = scheduleConfig.startHour;
    document.getElementById('total-hours').value = scheduleConfig.totalHours;
    
    // Generar opciones de horas para recreos al cargar
    generateBreakHourOptions();
    
    // Event listeners
    document.getElementById('export-btn').addEventListener('click', exportToPNG);
    document.getElementById('apply-config-btn').addEventListener('click', applyConfig);
    document.getElementById('add-break-btn').addEventListener('click', addBreak);
    
    // Agregar animaciones de entrada a las tarjetas del sidebar
    const configCards = document.querySelectorAll('.config-card-sidebar');
    configCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});