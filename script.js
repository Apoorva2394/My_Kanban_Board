let taskData = {};
const todos = document.querySelector('#todo');
const progress = document.querySelector('#progress');
const done = document.querySelector('#done');
const columns = [todos, progress, done];
let draggedElement = null;
let editTask = null;


function updateCount() {
    taskData = {}; 
    columns.forEach(col => {
        const columnTasks = col.querySelectorAll('.task');
        const countDisplay = col.querySelector(".right");
        
        taskData[col.id] = Array.from(columnTasks).map(t => {
            return {
                title: t.querySelector('h2').innerText,
                description: t.querySelector('p').innerText,
                date: t.querySelector('.date').innerText.replace('Due: ', '')
            }
        });        
        
        if (countDisplay) {
            countDisplay.innerText = columnTasks.length;
        }
    });
    localStorage.setItem("tasks", JSON.stringify(taskData));
}

function addTask(title, desc, date, column) {
    const div = document.createElement('div');
    div.classList.add('task');
    div.setAttribute('draggable', 'true');

    const today = new Date().toISOString().split('T')[0];
    if (date && date < today) {
        div.classList.add('overdue');
    }

    div.innerHTML = `
        <h2>${title}</h2>
        <p>${desc}</p>
        <span class="date">Due: ${date || 'No date'}</span>
        <div class="actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    column.appendChild(div);

    // Drag
    div.addEventListener('dragstart', () => draggedElement = div);

    // Delete
    div.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm("Delete this task?")) {
            div.remove();
            updateCount();
        }
    });

    // Edit
    div.querySelector('.edit-btn').addEventListener('click', () => {
        editTask = div;
        document.getElementById('task-title').value = title;
        document.getElementById('task-desc').value = desc;
        document.getElementById('task-date').value = date || '';
        modal.classList.add("active");
        addTaskbtn.innerText = "Update Task";
    });

    return div;
}


if (localStorage.getItem("tasks")) {
    const data = JSON.parse(localStorage.getItem("tasks"));
    for (const colId in data) {
        const column = document.querySelector(`#${colId}`);
        if (column) {
            data[colId].forEach(task => {
                addTask(task.title, task.description, task.date === 'No date' ? '' : task.date, column);
            });            
        }
    }
    updateCount();
} else {
    // If no localStorage, initialize existing tasks in DOM
    document.querySelectorAll('.task').forEach(task => {
        const title = task.querySelector('h2').innerText;
        const desc = task.querySelector('p').innerText;
        const column = task.parentElement;
        
        // Remove and re-add to attach listeners
        task.remove();
        addTask(title, desc, column);
    });
    updateCount();
}

function addDragOver(col) {
    col.addEventListener('dragenter', (e) => {
        e.preventDefault();
        col.classList.add('hover-over');
    });

    col.addEventListener('dragleave', (e) => {
        e.preventDefault();
        col.classList.remove('hover-over');
    });

    col.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    col.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement) {
            col.appendChild(draggedElement);
            updateCount();
        }
        col.classList.remove('hover-over');
    });
}

addDragOver(todos);
addDragOver(progress);
addDragOver(done);

const toggleModalBtn = document.querySelector('#toggle-modal');
const modal = document.querySelector('.modal');
const modalbg = document.querySelector('.modal .bg');
const addTaskbtn = document.getElementById('add-task');

toggleModalBtn.addEventListener('click', () => {
    modal.classList.add("active");
});

modalbg.addEventListener('click', () => {
    modal.classList.remove("active");
});

addTaskbtn.addEventListener('click', () => {
    handleAddTask();
});

function handleAddTask() {
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const date = document.getElementById('task-date').value;

    if (!title) {
        alert("Please enter a task title");
        return;
    }

    if (editTask) {
        editTask.querySelector('h2').innerText = title;
        editTask.querySelector('p').innerText = desc;
        editTask.querySelector('.date').innerText = `Due: ${date || 'No date'}`;

        const today = new Date().toISOString().split('T')[0];
        editTask.classList.toggle('overdue', date && date < today);

        editTask = null;
        addTaskbtn.innerText = "Add Task";
    } else {
        addTask(title, desc, date, todos);
    }

    updateCount();
    modal.classList.remove("active");

    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-date').value = '';
}


[document.getElementById('task-title'), document.getElementById('task-desc')].forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
        }
    });
});
