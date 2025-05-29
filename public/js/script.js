document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM para el menú principal
    const calendarOption = document.getElementById('calendar-option');
    const scheduleOption = document.getElementById('schedule-option');
    const tasksOption = document.getElementById('tasks-option');
    
    // Referencias a modales
    const calendarModal = document.getElementById('calendar-modal');
    const scheduleModal = document.getElementById('schedule-modal');
    const tasksModal = document.getElementById('tasks-modal');
    const eventModal = document.getElementById('event-modal');
    
    // Referencias a botones de cierre de modales
    const closeButtons = document.querySelectorAll('.close-button');
    
    // Referencias a formularios
    const calendarForm = document.getElementById('calendar-form');
    const scheduleForm = document.getElementById('schedule-form');
    const taskForm = document.getElementById('task-form');
    const examForm = document.getElementById('exam-form');
    const eventForm = document.getElementById('event-form');
    
    // Referencias a pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Datos de la aplicación (simulados, en una aplicación real se usaría localStorage o una base de datos)
    let calendars = [];
    let schedules = [];
    let tasks = [];
    let exams = [];
    let events = [];
    let currentCalendarId = null;
    let selectedDate = null;
    
    // Funciones para abrir modales
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Evita el scroll del body cuando el modal está abierto
    }
    
    // Función para cerrar modales
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaura el scroll del body
    }
    
    // Event listeners para opciones del menú principal
    calendarOption.querySelector('.action-button').addEventListener('click', function() {
        openModal(calendarModal);
    });
    
    scheduleOption.querySelector('.action-button').addEventListener('click', function() {
        openModal(scheduleModal);
    });
    
    tasksOption.querySelector('.action-button').addEventListener('click', function() {
        openModal(tasksModal);
    });
    
    // Event listeners para botones de cierre de modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // Event listeners para pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Desactivar todas las pestañas y contenidos
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Activar la pestaña seleccionada y su contenido
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Funciones para manejar formularios
    
    // Crear calendario
    calendarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const calendarName = document.getElementById('calendar-name').value;
        const calendarType = document.getElementById('calendar-type').value;
        
        const newCalendar = {
            id: Date.now(),
            name: calendarName,
            type: calendarType,
            events: []
        };
        
        calendars.push(newCalendar);
        
        // En una aplicación real, aquí guardaríamos en localStorage o enviaríamos a un servidor
        console.log('Calendario creado:', newCalendar);
        
        // Cerrar el modal y resetear el formulario
        closeModal(calendarModal);
        calendarForm.reset();
        
        // Actualizar la lista de calendarios
        updateCalendarsList();
    });
    
    // Crear horario
    scheduleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const scheduleName = document.getElementById('schedule-name').value;
        const hoursCount = parseInt(document.getElementById('hours-count').value);
        const startTime = document.getElementById('start-time').value;
        
        const newSchedule = {
            id: Date.now(),
            name: scheduleName,
            hoursCount: hoursCount,
            startTime: startTime,
            timeSlots: []
        };
        
        schedules.push(newSchedule);
        
        console.log('Horario creado:', newSchedule);
        
        closeModal(scheduleModal);
        scheduleForm.reset();
        
        // Actualizar la lista de calendarios y horarios
        updateCalendarsList();
    });
    
    // Añadir tarea
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskName = document.getElementById('task-name').value;
        const taskSubject = document.getElementById('task-subject').value;
        const taskDueDate = document.getElementById('task-due-date').value;
        const taskPriority = document.getElementById('task-priority').value;
        
        const newTask = {
            id: Date.now(),
            name: taskName,
            subject: taskSubject,
            dueDate: taskDueDate,
            priority: taskPriority,
            completed: false
        };
        
        tasks.push(newTask);
        
        console.log('Tarea añadida:', newTask);
        
        // Actualizar la lista de tareas
        updateTasksList();
        
        // Resetear el formulario
        taskForm.reset();
    });
    
    // Añadir examen
    examForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const examName = document.getElementById('exam-name').value;
        const examSubject = document.getElementById('exam-subject').value;
        const examDate = document.getElementById('exam-date').value;
        const examTime = document.getElementById('exam-time').value;
        
        const newExam = {
            id: Date.now(),
            name: examName,
            subject: examSubject,
            date: examDate,
            time: examTime
        };
        
        exams.push(newExam);
        
        console.log('Examen añadido:', newExam);
        
        // Actualizar la lista de exámenes
        updateExamsList();
        
        // Resetear el formulario
        examForm.reset();
    });
    
    // Crear evento
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventTitle = document.getElementById('event-title').value;
        const eventDescription = document.getElementById('event-description').value;
        const eventDate = document.getElementById('event-date').value;
        const eventTime = document.getElementById('event-time').value;
        const eventType = document.getElementById('event-type').value;
        
        const newEvent = {
            id: Date.now(),
            title: eventTitle,
            description: eventDescription,
            date: eventDate,
            time: eventTime,
            type: eventType,
            calendarId: currentCalendarId
        };
        
        events.push(newEvent);
        
        console.log('Evento creado:', newEvent);
        
        // Cerrar el modal y resetear el formulario
        closeModal(eventModal);
        eventForm.reset();
        
        // Actualizar la vista del calendario si está abierta
        if (currentCalendarId) {
            const calendar = calendars.find(cal => cal.id === currentCalendarId);
            if (calendar) {
                showCalendar(calendar);
            }
        }
    });
    
    // Funciones para actualizar listas
    function updateCalendarsList() {
        const calendarsList = document.getElementById('calendars-list');
        calendarsList.innerHTML = '';
        
        if (calendars.length === 0 && schedules.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No hay calendarios o horarios creados. Crea uno nuevo desde el menú lateral.';
            calendarsList.appendChild(emptyMessage);
            return;
        }
        
        // Mostrar calendarios
        calendars.forEach(calendar => {
            const calendarCard = document.createElement('div');
            calendarCard.className = 'calendar-card';
            
            const calendarTitle = document.createElement('h3');
            calendarTitle.textContent = calendar.name;
            
            const calendarType = document.createElement('p');
            calendarType.textContent = `Tipo: ${getCalendarTypeName(calendar.type)} (Calendario)`;
            
            const calendarActions = document.createElement('div');
            calendarActions.className = 'calendar-actions';
            
            const viewButton = document.createElement('button');
            viewButton.className = 'action-button';
            viewButton.textContent = 'Ver';
            viewButton.addEventListener('click', function() {
                showCalendar(calendar);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-button';
            deleteButton.textContent = 'Eliminar';
            deleteButton.style.backgroundColor = '#e74c3c';
            deleteButton.addEventListener('click', function() {
                deleteCalendar(calendar.id);
            });
            
            calendarActions.appendChild(viewButton);
            calendarActions.appendChild(deleteButton);
            
            calendarCard.appendChild(calendarTitle);
            calendarCard.appendChild(calendarType);
            calendarCard.appendChild(calendarActions);
            
            calendarsList.appendChild(calendarCard);
        });
        
        // Mostrar horarios
        schedules.forEach(schedule => {
            const scheduleCard = document.createElement('div');
            scheduleCard.className = 'calendar-card';
            scheduleCard.style.borderLeftColor = '#f39c12';
            
            const scheduleTitle = document.createElement('h3');
            scheduleTitle.textContent = schedule.name;
            
            const scheduleInfo = document.createElement('p');
            scheduleInfo.textContent = `Horario: ${schedule.hoursCount} horas desde ${schedule.startTime}`;
            
            const scheduleActions = document.createElement('div');
            scheduleActions.className = 'calendar-actions';
            
            const viewButton = document.createElement('button');
            viewButton.className = 'action-button';
            viewButton.textContent = 'Ver';
            viewButton.style.backgroundColor = '#f39c12';
            viewButton.addEventListener('click', function() {
                showSchedule(schedule);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-button';
            deleteButton.textContent = 'Eliminar';
            deleteButton.style.backgroundColor = '#e74c3c';
            deleteButton.addEventListener('click', function() {
                deleteSchedule(schedule.id);
            });
            
            scheduleActions.appendChild(viewButton);
            scheduleActions.appendChild(deleteButton);
            
            scheduleCard.appendChild(scheduleTitle);
            scheduleCard.appendChild(scheduleInfo);
            scheduleCard.appendChild(scheduleActions);
            
            calendarsList.appendChild(scheduleCard);
        });
    }
    
    function updateTasksList() {
        const pendingTasksList = document.getElementById('pending-tasks');
        pendingTasksList.innerHTML = '';
        
        tasks.forEach(task => {
            if (!task.completed) {
                const li = document.createElement('li');
                li.className = `priority-${task.priority}`;
                
                const taskInfo = document.createElement('div');
                taskInfo.className = 'task-info';
                
                const taskName = document.createElement('strong');
                taskName.textContent = task.name;
                
                const taskDetails = document.createElement('p');
                taskDetails.textContent = `${task.subject} - Entrega: ${formatDate(task.dueDate)}`;
                
                taskInfo.appendChild(taskName);
                taskInfo.appendChild(taskDetails);
                
                const taskActions = document.createElement('div');
                taskActions.className = 'task-actions';
                
                const completeIcon = document.createElement('i');
                completeIcon.className = 'fas fa-check action-icon';
                completeIcon.title = 'Marcar como completada';
                completeIcon.addEventListener('click', function() {
                    completeTask(task.id);
                });
                
                const editIcon = document.createElement('i');
                editIcon.className = 'fas fa-edit action-icon';
                editIcon.title = 'Editar tarea';
                
                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'fas fa-trash action-icon';
                deleteIcon.title = 'Eliminar tarea';
                deleteIcon.addEventListener('click', function() {
                    deleteTask(task.id);
                });
                
                taskActions.appendChild(completeIcon);
                taskActions.appendChild(editIcon);
                taskActions.appendChild(deleteIcon);
                
                li.appendChild(taskInfo);
                li.appendChild(taskActions);
                
                pendingTasksList.appendChild(li);
            }
        });
    }
    
    function updateExamsList() {
        const scheduledExamsList = document.getElementById('scheduled-exams');
        scheduledExamsList.innerHTML = '';
        
        exams.forEach(exam => {
            const li = document.createElement('li');
            
            const examInfo = document.createElement('div');
            examInfo.className = 'exam-info';
            
            const examName = document.createElement('strong');
            examName.textContent = exam.name;
            
            const examDetails = document.createElement('p');
            examDetails.textContent = `${exam.subject} - ${formatDate(exam.date)} a las ${exam.time}`;
            
            examInfo.appendChild(examName);
            examInfo.appendChild(examDetails);
            
            const examActions = document.createElement('div');
            examActions.className = 'exam-actions';
            
            const editIcon = document.createElement('i');
            editIcon.className = 'fas fa-edit action-icon';
            editIcon.title = 'Editar examen';
            
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash action-icon';
            deleteIcon.title = 'Eliminar examen';
            deleteIcon.addEventListener('click', function() {
                deleteExam(exam.id);
            });
            
            examActions.appendChild(editIcon);
            examActions.appendChild(deleteIcon);
            
            li.appendChild(examInfo);
            li.appendChild(examActions);
            
            scheduledExamsList.appendChild(li);
        });
    }
    
    // Funciones para crear vistas
    function showCalendar(calendar) {
        currentCalendarId = calendar.id;
        
        // Limpiar el contenido principal
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = '';
        
        // Crear encabezado
        const header = document.createElement('div');
        header.className = 'calendar-view-header';
        
        const backButton = document.createElement('button');
        backButton.className = 'action-button';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
        backButton.addEventListener('click', function() {
            currentCalendarId = null;
            // Volver a la lista de calendarios
            mainContent.innerHTML = '';
            const title = document.createElement('h2');
            title.textContent = 'Calendarios y Horarios Creados';
            mainContent.appendChild(title);
            
            const calendarsContainer = document.createElement('div');
            calendarsContainer.className = 'calendars-container';
            calendarsContainer.id = 'calendars-list';
            mainContent.appendChild(calendarsContainer);
            
            updateCalendarsList();
        });
        
        const title = document.createElement('h2');
        title.textContent = calendar.name;
        
        const addEventButton = document.createElement('button');
        addEventButton.className = 'action-button';
        addEventButton.innerHTML = '<i class="fas fa-plus"></i> Agregar Evento';
        addEventButton.style.marginLeft = 'auto';
        addEventButton.addEventListener('click', function() {
            openModal(eventModal);
        });
        
        header.appendChild(backButton);
        header.appendChild(title);
        header.appendChild(addEventButton);
        
        // Crear el calendario
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar';
        
        // Obtener el mes y año actual
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Crear el encabezado del mes
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        
        const monthTitle = document.createElement('h3');
        monthTitle.textContent = new Date(currentYear, currentMonth, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        monthHeader.appendChild(monthTitle);
        
        // Crear los días de la semana
        const weekdays = document.createElement('div');
        weekdays.className = 'weekdays';
        
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayNames.forEach(day => {
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = day;
            weekdays.appendChild(dayName);
        });
        
        // Generar los días del mes
        const calendarDays = generateMonthlyCalendar(currentYear, currentMonth);
        
        // Añadir todo al contenedor del calendario
        calendarContainer.appendChild(monthHeader);
        calendarContainer.appendChild(weekdays);
        calendarContainer.appendChild(calendarDays);
        
        // Añadir todo al contenido principal
        mainContent.appendChild(header);
        mainContent.appendChild(calendarContainer);
    }
    
    function showSchedule(schedule) {
        currentCalendarId = schedule.id;
        
        // Limpiar el contenido principal
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = '';
        
        // Crear encabezado
        const header = document.createElement('div');
        header.className = 'schedule-view-header';
        
        const backButton = document.createElement('button');
        backButton.className = 'action-button';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
        backButton.addEventListener('click', function() {
            currentCalendarId = null;
            // Volver a la lista de calendarios y horarios
            mainContent.innerHTML = '';
            const title = document.createElement('h2');
            title.textContent = 'Calendarios y Horarios Creados';
            mainContent.appendChild(title);
            
            const calendarsContainer = document.createElement('div');
            calendarsContainer.className = 'calendars-container';
            calendarsContainer.id = 'calendars-list';
            mainContent.appendChild(calendarsContainer);
            
            updateCalendarsList();
        });
        
        const title = document.createElement('h2');
        title.textContent = schedule.name;
        
        const addEventButton = document.createElement('button');
        addEventButton.className = 'action-button';
        addEventButton.innerHTML = '<i class="fas fa-plus"></i> Agregar Evento';
        addEventButton.style.marginLeft = 'auto';
        addEventButton.addEventListener('click', function() {
            openModal(eventModal);
        });
        
        header.appendChild(backButton);
        header.appendChild(title);
        header.appendChild(addEventButton);
        
        // Crear el horario
        const scheduleContainer = generateDailySchedule(schedule);
        
        // Añadir todo al contenido principal
        mainContent.appendChild(header);
        mainContent.appendChild(scheduleContainer);
    }
    
    // Funciones de utilidad
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    function getCalendarTypeName(type) {
        const types = {
            'academic': 'Académico',
            'personal': 'Personal',
            'project': 'Proyecto'
        };
        return types[type] || type;
    }
    
    // Función para obtener colores de eventos
    function getEventColor(type) {
        const colors = {
            'clase': '#3498db',
            'examen': '#e74c3c',
            'tarea': '#f39c12',
            'reunion': '#9b59b6',
            'evento': '#2ecc71',
            'otro': '#95a5a6'
        };
        return colors[type] || colors['otro'];
    }
    
    // Función para obtener colores de materias
    function getSubjectColor(subjectName) {
        const colors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f',
            '#8e44ad', '#2980b9', '#27ae60', '#d35400', '#7f8c8d',
            '#c0392b', '#16a085', '#2c3e50', '#f39c12', '#8e44ad'
        ];
        
        // Generar un índice basado en el nombre de la materia
        let hash = 0;
        for (let i = 0; i < subjectName.length; i++) {
            hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    // Funciones para eliminar elementos
    function completeTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = true;
            updateTasksList();
        }
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        updateTasksList();
    }
    
    function deleteExam(examId) {
        exams = exams.filter(exam => exam.id !== examId);
        updateExamsList();
    }
    
    function deleteCalendar(calendarId) {
        calendars = calendars.filter(calendar => calendar.id !== calendarId);
        updateCalendarsList();
    }
    
    // Función para generar un calendario mensual
    function generateMonthlyCalendar(year, month) {
        const date = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = date.getDay();
        
        const calendarDays = document.createElement('div');
        calendarDays.className = 'days';
        
        // Añadir días vacíos para alinear el primer día del mes
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Añadir los días del mes
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = i;
            
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'events';
            
            // Buscar eventos para este día
            const dayDate = new Date(year, month, i).toISOString().split('T')[0];
            const dayEvents = events.filter(event => event.date === dayDate && event.calendarId === currentCalendarId);
            
            // Mostrar eventos del día
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.textContent = event.title;
                eventElement.style.fontSize = '0.7rem';
                eventElement.style.backgroundColor = getEventColor(event.type);
                eventElement.style.color = 'white';
                eventElement.style.padding = '2px 4px';
                eventElement.style.borderRadius = '3px';
                eventElement.style.marginBottom = '2px';
                eventElement.style.overflow = 'hidden';
                eventElement.style.textOverflow = 'ellipsis';
                eventElement.style.whiteSpace = 'nowrap';
                eventsContainer.appendChild(eventElement);
            });
            
            dayElement.appendChild(dayNumber);
            dayElement.appendChild(eventsContainer);
            
            // Marcar el día actual
            const currentDate = new Date();
            if (year === currentDate.getFullYear() && month === currentDate.getMonth() && i === currentDate.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Añadir evento de clic
            dayElement.addEventListener('click', function() {
                document.querySelectorAll('.day').forEach(day => day.classList.remove('selected'));
                this.classList.add('selected');
                
                selectedDate = new Date(year, month, i).toISOString().split('T')[0];
                document.getElementById('event-date').value = selectedDate;
                console.log('Fecha seleccionada:', selectedDate);
                
                // Abrir modal para crear evento
                openModal(eventModal);
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        return calendarDays;
    }
    
    // Función para generar un horario diario
    function generateDailySchedule(schedule) {
        const scheduleContainer = document.createElement('div');
        scheduleContainer.className = 'weekly-schedule-container';
        
        // Crear grid de horario semanal
        const scheduleGrid = document.createElement('div');
        scheduleGrid.className = 'schedule-grid';
        
        // Crear encabezado con días de la semana
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        timeHeader.textContent = 'HORA';
        scheduleGrid.appendChild(timeHeader);
        
        const days = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            scheduleGrid.appendChild(dayHeader);
        });
        
        // Generar franjas horarias de 8:00 a 20:00
        for (let hour = 8; hour <= 20; hour++) {
            // Celda de hora
            const timeCell = document.createElement('div');
            timeCell.className = 'time-cell';
            timeCell.textContent = hour.toString().padStart(2, '0') + ':00';
            scheduleGrid.appendChild(timeCell);
            
            // Celdas para cada día
            days.forEach((day, dayIndex) => {
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                dayCell.dataset.day = dayIndex;
                dayCell.dataset.hour = hour;
                
                // Crear clave única para esta celda
                 const cellKey = `${currentCalendarId}_${dayIndex}_${hour}`;
                 
                 // Buscar contenido personalizado para esta celda
                 const savedContent = localStorage.getItem(cellKey) || '';
                 
                 // Crear input editable para la celda
                 const cellInput = document.createElement('input');
                 cellInput.type = 'text';
                 cellInput.value = savedContent;
                 cellInput.placeholder = 'Materia/Actividad';
                 cellInput.style.border = 'none';
                 cellInput.style.background = 'transparent';
                 cellInput.style.width = '100%';
                 cellInput.style.textAlign = 'center';
                 cellInput.style.fontSize = '0.75rem';
                 cellInput.style.outline = 'none';
                 
                 // Si hay contenido, aplicar estilos de materia
                 if (savedContent) {
                     dayCell.style.backgroundColor = getSubjectColor(savedContent);
                     dayCell.style.color = 'white';
                     dayCell.style.fontWeight = 'bold';
                     dayCell.classList.add('has-subject');
                     cellInput.style.color = 'white';
                     cellInput.style.fontWeight = 'bold';
                 }
                 
                 // Guardar contenido al cambiar
                 cellInput.addEventListener('blur', function() {
                     const content = this.value.trim();
                     if (content) {
                         localStorage.setItem(cellKey, content);
                         dayCell.style.backgroundColor = getSubjectColor(content);
                         dayCell.style.color = 'white';
                         dayCell.style.fontWeight = 'bold';
                         dayCell.classList.add('has-subject');
                         this.style.color = 'white';
                         this.style.fontWeight = 'bold';
                     } else {
                         localStorage.removeItem(cellKey);
                         dayCell.style.backgroundColor = 'white';
                         dayCell.style.color = '#495057';
                         dayCell.style.fontWeight = 'normal';
                         dayCell.classList.remove('has-subject');
                         this.style.color = '#495057';
                         this.style.fontWeight = 'normal';
                     }
                 });
                 
                 // Guardar con Enter
                 cellInput.addEventListener('keypress', function(e) {
                     if (e.key === 'Enter') {
                         this.blur();
                     }
                 });
                 
                 dayCell.appendChild(cellInput);
                
                scheduleGrid.appendChild(dayCell);
            });
        }
        
        scheduleContainer.appendChild(scheduleGrid);
        return scheduleContainer;
    }
    
    // Inicializar la lista de calendarios
    updateCalendarsList();
});