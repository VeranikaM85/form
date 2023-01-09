"use strict"

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    form.addEventListener('submit', formSend); //при отправке формы переходим в функцию formSend

    async function formSend(e) { //запрет на отправку пустой формы
        e.preventDefault();

        let error = formValidate(form); //валидация формы

        let formData = new FormData(form);  //в этой строке вытягиваются все данные из полей
        formData.append('image', formImage.files[0]); //а в этой вытягивается изображение
        
        if (error===0){ //когда error=0, значит форма прошла валидацию
            form.classList.add('_sending');  //пока отправляется форма
            let response = await fetch('sendmail.php', { //ждем отправление данных методом POST в файл sendmail.php
                method: 'POST',
                body: formData
            });
            if(response.ok){
                let result = await response.json();  //получение json ответа после отправки
                alert(result.message);
                formPreview.innerHTML = ''; //очистка формы после отправки - изображения
                form.reset();   //и всех полей
                form.classList.remove('_sending');
            }else{
                alert('Ошибка.');
                form.classList.remove('_sending');
            }
        }else{
            alert('Заполните обязательные поля')
        }
    }

    function formValidate(form) {
        let error = 0;
        let formReq = document.querySelectorAll('._req'); //обязательные поля

        for  (let index = 0; index < formReq.length; index++) {
            const input = formReq[index];
            formRemoveError(input); //каждый раз вначале нужно убрать класс error

            if (input.classList.contains('_email')){
                if (emailTest(input)){
                    formAddError(input);
                    error++;
                }
            }else if(input.getAttribute("type") === "checkbox" && input.checked === false) {
                formAddError(input);
                error++;
            }else{
                if (input.value === ''){
                    formAddError(input);
                    error++;
                }
            }
        }
        return error;
    }
    function formAddError(input) {     //добавляют класс error у родителя и объекта
        input.parentElement.classList.add('_error');
        input.classList.add('_error');
    }
    function formRemoveError(input) {    //убирают класс error у родителя и объекта
        input.parentElement.classList.remove('_error');
        input.classList.remove('_error');
    }
    function emailTest(input) {  //функция проверки email
        return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
    }

    //получаем инпут file в переменную
    const formImage = document.getElementById('formImage');
    //получаем див для превью в переменную
    const formPreview = document.getElementById('formPreview');

    //слушаем изменения в инпуте file
    formImage.addEventListener('change', () => {
        uploadFile(formImage.files[0]);
    });
    
    function uploadFile(file) {
        //проверяем тип файла
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            alert('Разрешены только изображения.');
            formImage.value = '';
            return;
        }
        //проверяем размер файла (<2 мб)
        if (file.size> 2 *1024 *1024) {
            alert('Файл должен быть менее 2 мб.');
            return;
        }

        //вывод выбранного изображения на экран в превью
        var reader = new FileReader();
        reader.onload = function (e) {
            formPreview.innerHTML = `<img src="${e.target.result}" alt="Фото">`;
        };
        reader.onerror = function (e) {
            alert('Ошибка');
        };
        reader.readAsDataURL(file);
    }
});