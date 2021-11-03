(function () {
    function createAppTitle(title) {
        //функция формирует заголовок по заданному значению
        let appTitle = document.createElement('h2');
        appTitle.innerHTML = title;
        return appTitle;
    }

    function createTodoItemForm() {
        //функция формирует форму ввода данных
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWrapper = document.createElement('div');
        let button = document.createElement('button');

        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        input.placeholder = 'Введите название нового дела';
        buttonWrapper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Добавить дело';
        button.setAttribute('disabled', true); //кнопка недоступна, пока поле пустое
        

        buttonWrapper.append(button);
        form.append(input);
        form.append(buttonWrapper);

        return {
            form,
            input,
            button,
        };
    }

    function createTodoList() {
        //функция формирует список дел (пока пустой)
        let list = document.createElement('ul');
        list.classList.add('list-group');
        return list;
    }

    function createTodoItem(name, status = false) {
        //функция формирует элемент списка - дело - с двумя кнопками - готово и удалить
        let item = document.createElement('li');

        let buttonGroup = document.createElement('div');
        let doneButton = document.createElement('button');
        let deleteButton = document.createElement('button');


        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        if (status) item.classList.add('list-group-item-success'); //если дело выполнено, так и помечаем
        item.textContent = name;

        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = "Готово";
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = "Удалить";

        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        item.append(buttonGroup);

        return {
            item,
            status,
            doneButton,
            deleteButton,
        }
    }



    function checkDone(currentItem, currentList, currentValue, page){
        //функция отмечает дело как выполненное (или снимает эту метку) и добавляет в локальное хранилище данные об этом
        currentItem.doneButton.addEventListener('click', function () {
                currentItem.item.classList.toggle('list-group-item-success');
                
                //ищем в списке именно это дело, которое мы выполнили, по имени
                let i = -1;
                for (let j = 0; j <currentList.length; j++){
                    if (currentList[j].name === currentValue){
                        i = j;
                        break;
                    };
                }       

                //заносим в спиок значение о состоянии дела
                if (currentItem.item.classList.contains('list-group-item-success')) {
                    currentList[i].done = true;    
                }
                else {
                    currentList[i].done = false;    
                }
                addToLocalItem(currentList, page); //отправляем в хранилище


            });
    }

    function deleteItem(currentItem, currentList, currentValue, page) {
        //функция удаляет объект с экрана и из хранилища
        currentItem.deleteButton.addEventListener('click', function () {
            if (confirm('Вы уверены?')) { 
                let i = -1;
                //ищем нужное дело по имени
                for (let j = 0; j < currentList.length; j++){
                    if (currentList[j].name === currentValue){
                        i = j;
                        break;
                    };
                }       
                //удаляем дело из списка и из хранилища
                currentItem.item.remove(); 
                currentList.splice(i, 1); 
                addToLocalItem(currentList, page);

            }
        });
    }

    function addToLocalItem(list, page){
        //функция обновляет данные в хранилище
        let listString = JSON.stringify(list);
        localStorage.removeItem(page);
        localStorage.setItem(page, listString);
    }

    function createTodoApp(container, title = 'Список дел', page = 'data') {


        let todoAppTitle = createAppTitle(title);
        let todoItemForm = createTodoItemForm();
        let todoList = createTodoList();
        let todoListSave = [];


        container.append(todoAppTitle);
        container.append(todoItemForm.form);
        container.append(todoList);

        //вынимаем элементы из хранилища
        let localData;
        localData = localStorage.getItem(page);
        localData = JSON.parse(localData);

        //если элементы есть, то каждое дело отображаем на экране, 
        //добавляем в список и даём возможность удалять его и отмечать как выполненное
        if (localData){
            let localItem;
            for (object of localData) {
                localItem = createTodoItem(object.name, object.done);
                todoList.append(localItem.item);
                todoListSave.push(object);
                checkDone(localItem, todoListSave, object.name, page);
                deleteItem(localItem, todoListSave, object.name, page);
            } 
        }
        

        //следим за состоянием строки ввода. если что-то появляется - кнопка становится доступной
        setTimeout(function(){
            todoItemForm.input.addEventListener('input', function(){
            if (todoItemForm.input.value) {
                todoItemForm.button.removeAttribute('disabled');   
            }
            else {
                todoItemForm.button.setAttribute('disabled', true);
            }
        })
        }, 20);

        

        todoItemForm.form.addEventListener('submit', function (e) {
                
            e.preventDefault(); //предотвращается дефолтное поведение формы (отправка на сервер)


            if (!todoItemForm.input.value) {
                return;
            }

            let todoItem = createTodoItem(todoItemForm.input.value);


            //формируем список по значениям
            let todoItemValue = todoItemForm.input.value;
            todoListSave.push({name: todoItemValue, done: false});

            //оживляем кнопки элементов            
            checkDone(todoItem, todoListSave, todoItemValue, page);
            deleteItem(todoItem, todoListSave, todoItemValue, page);

            
            todoList.append(todoItem.item); //отображаем значение на экране
            todoItemForm.input.value = ''; //очищаем поле ввода
            todoItemForm.button.setAttribute('disabled', true); //блокируем кнопку



            addToLocalItem(todoListSave, page); //обновляем данные в хранилище - добавляем новый элемент
        })   
        

    }

    window.createTodoApp = createTodoApp; 

})();
