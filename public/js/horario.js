// Configuración del horario
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Configuración por defecto
let scheduleConfig = {
    customHours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'], // Array de horas personalizables
    totalRows: 8, // Número de filas en lugar de horas
    breaks: [], // Array de objetos {hour: '10:00', name: 'Recreo'}
    dayHeaderColor: '#667eea' // Color de fondo para los encabezados de días
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
    
    // Usar las horas personalizadas de la configuración
    for (let i = 0; i < scheduleConfig.customHours.length; i++) {
        const timeString = scheduleConfig.customHours[i];
        
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
    
    // Verificar si hay un color personalizado guardado
    const customColors = JSON.parse(localStorage.getItem('customSubjectColors') || '{}');
    if (customColors[subject]) {
        return customColors[subject];
    }
    
    // Colores predeterminados
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
        
        // Aplicar color personalizado si está definido
        if (scheduleConfig.dayHeaderColor) {
            dayHeader.style.background = scheduleConfig.dayHeaderColor;
        }
        
        scheduleGrid.appendChild(dayHeader);
    });
    
    // Generar horas basado en configuración
    const hours = generateHours();
    
    // Preparar matriz para seguimiento de celdas combinadas
    const mergedCells = {};
    DAYS.forEach(day => {
        mergedCells[day] = {};
    });
    
    // Detectar asignaturas consecutivas para combinar celdas
    for (let i = 0; i < hours.length; i++) {
        if (hours[i].isBreak) continue;
        
        DAYS.forEach(day => {
            // Saltar si esta celda ya está marcada para omitir
            if (mergedCells[day][hours[i].time] && mergedCells[day][hours[i].time].skipRender) {
                return;
            }
            
            const currentSubject = localStorage.getItem(`schedule_${day}_${hours[i].time}`);
            if (!currentSubject) return;
            
            // Verificar si hay marcadores temporales (celdas recién divididas)
            const currentTimestamp = localStorage.getItem(`schedule_${day}_${hours[i].time}_timestamp`);
            
            // Verificar cuántas horas consecutivas tienen la misma asignatura
            let spanCount = 1;
            
            // Solo combinar si no hay marcador temporal
            if (!currentTimestamp) {
                // Verificar segunda hora
                if (i + 1 < hours.length && !hours[i+1].isBreak) {
                    const nextSubject = localStorage.getItem(`schedule_${day}_${hours[i+1].time}`);
                    const nextTimestamp = localStorage.getItem(`schedule_${day}_${hours[i+1].time}_timestamp`);
                    
                    if (nextSubject && currentSubject === nextSubject && !nextTimestamp) {
                        spanCount = 2;
                        
                        // Verificar tercera hora
                        if (i + 2 < hours.length && !hours[i+2].isBreak) {
                            const nextNextSubject = localStorage.getItem(`schedule_${day}_${hours[i+2].time}`);
                            const nextNextTimestamp = localStorage.getItem(`schedule_${day}_${hours[i+2].time}_timestamp`);
                            
                            if (nextNextSubject && currentSubject === nextNextSubject && !nextNextTimestamp) {
                                spanCount = 3;
                            }
                        }
                    }
                }
            }
            
            // Si encontramos horas consecutivas para combinar
            if (spanCount > 1) {
                // Marcar la primera celda para combinar
                mergedCells[day][hours[i].time] = {
                    subject: currentSubject,
                    spanCount: spanCount
                };
                
                // Marcar las celdas siguientes para omitir
                for (let j = 1; j < spanCount; j++) {
                    if (i + j < hours.length) {
                        mergedCells[day][hours[i+j].time] = {
                            subject: currentSubject,
                            skipRender: true
                        };
                    }
                }
            }
        });
    }
    
    // Crear filas de horarios
    hours.forEach((hourObj, hourIndex) => {
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
                // Verificar si esta celda debe omitirse (parte de una celda combinada)
                if (mergedCells[day][hourObj.time] && mergedCells[day][hourObj.time].skipRender) {
                    return; // Omitir esta celda
                }
                
                const cell = document.createElement('div');
                cell.className = 'schedule-cell';
                cell.dataset.day = day;
                cell.dataset.hour = hourObj.time;
                
                // Verificar si esta celda debe combinarse con las siguientes
                const mergeInfo = mergedCells[day][hourObj.time];
                if (mergeInfo && mergeInfo.spanCount && mergeInfo.spanCount > 1) {
                    // Configurar celda combinada
                    cell.classList.add('merged-cell');
                    cell.style.gridRow = `span ${mergeInfo.spanCount}`;
                    
                    // Crear contenedor para centrar el contenido verticalmente
                    const contentContainer = document.createElement('div');
                    contentContainer.className = 'merged-cell-content';
                    
                    // Crear input editable
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'subject-input';
                    input.placeholder = 'Materia';
                    input.value = mergeInfo.subject;
                    
                    // Aplicar estilo a la celda combinada
                    cell.style.backgroundColor = getSubjectColor(mergeInfo.subject);
                    cell.classList.add('has-subject');
                    
                    // Event listeners para guardar cambios
                    input.addEventListener('blur', () => {
                        // Guardar en todas las horas combinadas
                        const currentHour = hourObj.time;
                        const hourParts = currentHour.split(':');
                        const startHour = parseInt(hourParts[0]);
                        
                        if (input.value.trim() !== mergeInfo.subject) {
                            // Si cambió el valor, actualizar todas las celdas
                            for (let i = 0; i < mergeInfo.spanCount; i++) {
                                const hourToUpdate = `${(startHour + i).toString().padStart(2, '0')}:00`;
                                localStorage.setItem(`schedule_${day}_${hourToUpdate}`, input.value);
                            }
                            cell.style.backgroundColor = getSubjectColor(input.value);
                        }
                    });
                    
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            input.blur();
                        }
                    });
                    
                    // Event listener para menú contextual (click derecho)
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        showContextMenu(e, day, hourObj.time, mergeInfo.spanCount);
                    });
                    
                    contentContainer.appendChild(input);
                    cell.appendChild(contentContainer);
                } else {
                    // Celda normal (no combinada)
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
                    
                    // Event listener para menú contextual en celdas normales
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        // Solo mostrar menú si la celda tiene contenido
                        if (input.value.trim()) {
                            showContextMenu(e, day, hourObj.time, 1);
                        }
                    });
                    
                    cell.appendChild(input);
                }
                
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
        
        // Verificar si hay que combinar con horas adyacentes
        checkAndCombineCells(day, hour, subject);
    } else {
        localStorage.removeItem(`schedule_${day}_${hour}`);
        cell.style.backgroundColor = '#f8f9fa';
        cell.classList.remove('has-subject');
    }
    
    // Regenerar el horario para aplicar los cambios de combinación
    generateSchedule();
}

// Función para verificar y combinar celdas con la misma asignatura
function checkAndCombineCells(day, hour, subject) {
    // Convertir la hora a un número para poder calcular las horas adyacentes
    const hourParts = hour.split(':');
    const currentHour = parseInt(hourParts[0]);
    
    // Calcular horas anteriores y siguientes
    const prevHour = `${(currentHour - 1).toString().padStart(2, '0')}:00`;
    const prevPrevHour = `${(currentHour - 2).toString().padStart(2, '0')}:00`;
    const nextHour = `${(currentHour + 1).toString().padStart(2, '0')}:00`;
    const nextNextHour = `${(currentHour + 2).toString().padStart(2, '0')}:00`;
    
    // Verificar si alguna celda tiene un marcador temporal (recién dividida)
    const currentTimestamp = localStorage.getItem(`schedule_${day}_${hour}_timestamp`);
    const prevTimestamp = localStorage.getItem(`schedule_${day}_${prevHour}_timestamp`);
    const nextTimestamp = localStorage.getItem(`schedule_${day}_${nextHour}_timestamp`);
    const prevPrevTimestamp = localStorage.getItem(`schedule_${day}_${prevPrevHour}_timestamp`);
    const nextNextTimestamp = localStorage.getItem(`schedule_${day}_${nextNextHour}_timestamp`);
    
    // Si alguna celda tiene un marcador temporal, no combinar
    if (currentTimestamp || prevTimestamp || nextTimestamp || prevPrevTimestamp || nextNextTimestamp) {
        return;
    }
    
    // Verificar combinaciones posibles
    const prevSubject = localStorage.getItem(`schedule_${day}_${prevHour}`);
    const prevPrevSubject = localStorage.getItem(`schedule_${day}_${prevPrevHour}`);
    const nextSubject = localStorage.getItem(`schedule_${day}_${nextHour}`);
    const nextNextSubject = localStorage.getItem(`schedule_${day}_${nextNextHour}`);
    
    // Verificar si hay 3 horas consecutivas (actual + 2 siguientes)
    if (nextSubject === subject && nextNextSubject === subject) {
        // Se combinará al regenerar el horario (3 horas)
    }
    // Verificar si hay 3 horas consecutivas (anterior + actual + siguiente)
    else if (prevSubject === subject && nextSubject === subject) {
        // Se combinará al regenerar el horario (3 horas)
    }
    // Verificar si hay 3 horas consecutivas (2 anteriores + actual)
    else if (prevSubject === subject && prevPrevSubject === subject) {
        // Se combinará al regenerar el horario (3 horas)
    }
    // Verificar si hay 2 horas consecutivas (actual + siguiente)
    else if (nextSubject === subject) {
        // Se combinará al regenerar el horario (2 horas)
    }
    // Verificar si hay 2 horas consecutivas (anterior + actual)
    else if (prevSubject === subject) {
        // Se combinará al regenerar el horario (2 horas)
    }
    
    // Nota: No es necesario hacer nada aquí, ya que generateSchedule() 
    // se encargará de detectar y combinar las celdas
}

// Función para mostrar menú contextual
function showContextMenu(event, day, hour, spanCount) {
    // Remover menú existente si lo hay
    const existingMenu = document.getElementById('context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Crear menú contextual
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.style.left = event.clientX + 'px';
    contextMenu.style.top = event.clientY + 'px';
    
    // Ajustar posición para evitar que se salga de la pantalla
    setTimeout(() => {
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
    }, 0);
    
    // Obtener el contenido actual de la celda
    const currentSubject = localStorage.getItem(`schedule_${day}_${hour}`);
    
    // Crear título del menú (nombre de la asignatura)
    if (currentSubject && currentSubject.trim() !== '') {
        const menuTitle = document.createElement('div');
        menuTitle.className = 'context-menu-item';
        menuTitle.style.fontWeight = 'bold';
        menuTitle.style.borderBottom = '1px solid var(--context-menu-border)';
        menuTitle.innerHTML = `<i class="fas fa-book"></i> ${currentSubject}`;
        contextMenu.appendChild(menuTitle);
        
        // Añadir separador
        const divider = document.createElement('div');
        divider.className = 'context-menu-divider';
        contextMenu.appendChild(divider);
        
        // Opción para cambiar color (personalizado)
        const colorOption = document.createElement('div');
        colorOption.className = 'context-menu-item';
        colorOption.innerHTML = '<i class="fas fa-palette"></i> Cambiar color';
        
        // Crear selector de color oculto
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.style.position = 'absolute';
        colorPicker.style.visibility = 'hidden';
        colorPicker.value = getSubjectColor(currentSubject);
        document.body.appendChild(colorPicker);
        
        colorOption.addEventListener('click', () => {
            // Mostrar selector de color
            colorPicker.click();
        });
        
        colorPicker.addEventListener('change', () => {
            // Guardar color personalizado
            const customColors = JSON.parse(localStorage.getItem('customSubjectColors') || '{}');
            customColors[currentSubject] = colorPicker.value;
            localStorage.setItem('customSubjectColors', JSON.stringify(customColors));
            
            // Regenerar horario para aplicar cambios
            generateSchedule();
            contextMenu.remove();
        });
        
        contextMenu.appendChild(colorOption);
    }
    
    // Opción de dividir (solo si la celda está combinada)
    if (spanCount > 1) {
        // Si ya hay otras opciones, añadir separador
        if (contextMenu.children.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'context-menu-divider';
            contextMenu.appendChild(divider);
        }
        
        const divideOption = document.createElement('div');
        divideOption.className = 'context-menu-item';
        divideOption.innerHTML = '<i class="fas fa-cut"></i> Dividir';
        divideOption.addEventListener('click', () => {
            divideCells(day, hour, spanCount);
            contextMenu.remove();
        });
        contextMenu.appendChild(divideOption);
    }
    
    // Si no hay opciones disponibles, no mostrar el menú
    if (contextMenu.children.length === 0) {
        return;
    }
    
    document.body.appendChild(contextMenu);
    
    // Cerrar menú al hacer clic fuera
    const closeMenu = (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
}

// Función para dividir celdas combinadas
function divideCells(day, hour, spanCount) {
    console.log('Dividiendo celdas:', day, hour, spanCount);
    
    const hourParts = hour.split(':');
    const startHour = parseInt(hourParts[0]);
    
    // Obtener el contenido actual de la celda combinada
    const currentSubject = localStorage.getItem(`schedule_${day}_${hour}`);
    console.log('Contenido actual:', currentSubject);
    
    // Limpiar cualquier marcador temporal existente
    for (let i = 0; i < spanCount; i++) {
        const hourToUpdate = `${(startHour + i).toString().padStart(2, '0')}:00`;
        localStorage.removeItem(`schedule_${day}_${hourToUpdate}_timestamp`);
    }
    
    // Añadir marcadores temporales únicos para cada celda
    const baseTimestamp = Date.now();
    for (let i = 0; i < spanCount; i++) {
        const hourToUpdate = `${(startHour + i).toString().padStart(2, '0')}:00`;
        // Mantener el contenido original en cada celda
        localStorage.setItem(`schedule_${day}_${hourToUpdate}`, currentSubject || '');
        // Añadir timestamp único para cada celda
        localStorage.setItem(`schedule_${day}_${hourToUpdate}_timestamp`, baseTimestamp + (i * 1000));
    }
    
    console.log('Regenerando horario...');
    // Regenerar el horario para mostrar las celdas divididas
    generateSchedule();
    
    // Eliminar los marcadores temporales después de que se complete la regeneración
    setTimeout(() => {
        console.log('Eliminando marcadores temporales...');
        for (let i = 0; i < spanCount; i++) {
            const hourToUpdate = `${(startHour + i).toString().padStart(2, '0')}:00`;
            localStorage.removeItem(`schedule_${day}_${hourToUpdate}_timestamp`);
        }
        console.log('División completada');
    }, 1000); // Aumentado a 1 segundo para asegurar que se complete la regeneración
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
    const totalRows = parseInt(document.getElementById('total-rows').value);
    
    // Obtener el color seleccionado para los encabezados de días
    const dayHeaderColor = document.getElementById('day-header-color').value;
    
    // Ajustar el array de horas personalizadas según el número de filas
    const currentHours = scheduleConfig.customHours.slice(0, totalRows);
    
    // Si necesitamos más filas, agregar horas adicionales
    while (currentHours.length < totalRows) {
        const lastHour = currentHours[currentHours.length - 1];
        const lastHourParts = lastHour.split(':');
        const nextHour = (parseInt(lastHourParts[0]) + 1).toString().padStart(2, '0');
        currentHours.push(`${nextHour}:00`);
    }
    
    scheduleConfig.customHours = currentHours;
    scheduleConfig.totalRows = totalRows;
    scheduleConfig.dayHeaderColor = dayHeaderColor;
    
    saveConfig();
    generateSchedule();
    generateBreakHourOptions();
    
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

// Función para actualizar lista de horas personalizadas
function updateCustomHoursList() {
    const hoursList = document.getElementById('custom-hours-list');
    if (!hoursList) return;
    
    hoursList.innerHTML = '';
    
    scheduleConfig.customHours.forEach((hour, index) => {
        const hourItem = document.createElement('div');
        hourItem.className = 'hour-item';
        hourItem.innerHTML = `
            <input type="time" value="${hour}" onchange="updateCustomHour(${index}, this.value)" class="hour-input">
            <button onclick="removeCustomHour(${index})" class="remove-hour-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        hoursList.appendChild(hourItem);
    });
}

// Función para actualizar una hora personalizada
function updateCustomHour(index, newTime) {
    scheduleConfig.customHours[index] = newTime;
    saveConfig();
    generateSchedule();
    generateBreakHourOptions();
}

// Función para eliminar una hora personalizada
function removeCustomHour(index) {
    if (scheduleConfig.customHours.length > 1) {
        scheduleConfig.customHours.splice(index, 1);
        scheduleConfig.totalRows = scheduleConfig.customHours.length;
        saveConfig();
        generateSchedule();
        generateBreakHourOptions();
        updateCustomHoursList();
        document.getElementById('total-rows').value = scheduleConfig.totalRows;
    } else {
        alert('Debe haber al menos una hora en el horario');
    }
}

// Función para agregar una nueva hora personalizada
function addCustomHour() {
    const lastHour = scheduleConfig.customHours[scheduleConfig.customHours.length - 1];
    const lastHourParts = lastHour.split(':');
    const nextHour = (parseInt(lastHourParts[0]) + 1).toString().padStart(2, '0');
    const newTime = `${nextHour}:00`;
    
    scheduleConfig.customHours.push(newTime);
    scheduleConfig.totalRows = scheduleConfig.customHours.length;
    saveConfig();
    generateSchedule();
    generateBreakHourOptions();
    updateCustomHoursList();
    document.getElementById('total-rows').value = scheduleConfig.totalRows;
}

// Función para generar opciones de horas para recreos
function generateBreakHourOptions() {
    const select = document.getElementById('break-hour');
    select.innerHTML = '<option value="">Seleccionar hora</option>';
    
    // Usar directamente las horas personalizadas
    scheduleConfig.customHours.forEach(timeString => {
        // Verificar si esta hora ya es un recreo
        const isBreak = scheduleConfig.breaks.some(b => b.hour === timeString);
        
        if (!isBreak) {
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = timeString;
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
    updateCustomHoursList();
    
    // Configurar valores iniciales en el panel de configuración
    document.getElementById('total-rows').value = scheduleConfig.totalRows || scheduleConfig.customHours.length;
    
    // Configurar el color de los encabezados de días
    if (scheduleConfig.dayHeaderColor) {
        document.getElementById('day-header-color').value = scheduleConfig.dayHeaderColor;
    }
    
    // Migrar configuración antigua si existe
    if (scheduleConfig.startHour !== undefined && scheduleConfig.totalHours !== undefined) {
        const newCustomHours = [];
        for (let i = 0; i < scheduleConfig.totalHours; i++) {
            const hour = scheduleConfig.startHour + i;
            newCustomHours.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        scheduleConfig.customHours = newCustomHours;
        scheduleConfig.totalRows = scheduleConfig.totalHours;
        delete scheduleConfig.startHour;
        delete scheduleConfig.totalHours;
        saveConfig();
    }
    
    // Generar opciones de horas para recreos al cargar
    generateBreakHourOptions();
    
    // Event listeners
    document.getElementById('export-btn').addEventListener('click', exportToPNG);
    document.getElementById('apply-config-btn').addEventListener('click', applyConfig);
    document.getElementById('add-break-btn').addEventListener('click', addBreak);
    
    // Event listener para agregar hora personalizada
    const addHourBtn = document.getElementById('add-hour-btn');
    if (addHourBtn) {
        addHourBtn.addEventListener('click', addCustomHour);
    }
    
    // Agregar animaciones de entrada a las tarjetas del sidebar
    const configCards = document.querySelectorAll('.config-card-sidebar');
    configCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});