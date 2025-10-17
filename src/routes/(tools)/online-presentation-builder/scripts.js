let currentSlideId = 1;

function addSlide() {
    const slidesList = document.getElementById('slides-list');
    const newSlideId = slidesList.children.length + 1;
    const slideItem = document.createElement('div');
    slideItem.className = 'slide-item';
    slideItem.setAttribute('data-slide-id', newSlideId);
    slideItem.setAttribute('onclick', `selectSlide(${newSlideId})`);
    slideItem.innerHTML = `
        <input class="a" type="text" value="Slide ${newSlideId}" onchange="changeSlideName(${newSlideId})">
    `;
    slidesList.appendChild(slideItem);

    const slideEditor = document.getElementById('slide-editor');
    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';
    slideContent.id = `slide-${newSlideId}`;
    slideContent.setAttribute('contenteditable', 'true');
    slideContent.innerHTML = `
        <div class="slide-title">
            <h1 contenteditable="true">Title</h1>
        </div>
        <p contenteditable="true">Subtitle</p>
        <div class="slide-content-text" contenteditable="true">
            <p contenteditable="true">Content goes here. Click to edit.</p>
        </div>
    `;
    slideEditor.appendChild(slideContent);

    selectSlide(newSlideId);
}

function selectSlide(slideId) {
    currentSlideId = slideId;
    document.querySelectorAll('.slide-item').forEach(item => item.classList.remove('selected'));
    document.querySelector(`.slide-item[data-slide-id="${slideId}"]`).classList.add('selected');

    document.querySelectorAll('.slide-content').forEach(content => content.style.display = 'none');
    document.getElementById(`slide-${slideId}`).style.display = 'block';
}

function addText() {
    const slideContent = document.getElementById(`slide-${currentSlideId}`);
    const textElement = document.createElement('div');
    textElement.className = 'draggable';
    textElement.setAttribute('draggable', 'true');
    textElement.innerHTML = '<p contenteditable="true">New Text</p>';
    slideContent.appendChild(textElement);
    enableDrag(textElement);
}

function enableDrag(element) {
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    setTimeout(() => {
        event.target.style.visibility = 'hidden';
    }, 50);
}

function dragEnd(event) {
    event.target.style.visibility = 'visible';
    event.preventDefault();
    const slideContent = document.getElementById(`slide-${currentSlideId}`);
    const rect = slideContent.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    event.target.style.left = `${x}px`;
    event.target.style.top = `${y}px`;
}

function changeFont() {
    const fontSelect = document.getElementById('font-select');
    const font = fontSelect.value;
    document.execCommand('fontName', false, font);
}

function changeColor() {
    const colorPicker = document.getElementById('color-picker');
    const color = colorPicker.value;
    document.execCommand('foreColor', false, color);
}

function downloadPresentation() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const slides = document.querySelectorAll('.slide-content');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    const processSlide = (slideContent, index) => {
        return new Promise((resolve) => {
            const slideClone = slideContent.cloneNode(true);
            slideClone.style.display = 'block';
            slideClone.style.position = 'relative';
            slideClone.style.width = `${width}px`;
            slideClone.style.height = `${height}px`;

            const container = document.createElement('div');
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.appendChild(slideClone);

            document.body.appendChild(container);  // Append to body to ensure proper rendering

            html2canvas(container, { backgroundColor: '#ffffff' }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg');
                pdf.addImage(imgData, 'JPEG', 0, 0, width, height);

                if (index < slides.length - 1) {
                    pdf.addPage();
                }
                document.body.removeChild(container);  // Clean up the container
                resolve();
            });
        });
    };

    const slidePromises = Array.from(slides).map((slideContent, index) => processSlide(slideContent, index));

    Promise.all(slidePromises).then(() => {
        pdf.save('presentation.pdf');
    });
}

function sharePresentation() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const slides = document.querySelectorAll('.slide-content');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    const processSlide = (slideContent, index) => {
        return new Promise((resolve) => {
            const slideClone = slideContent.cloneNode(true);
            slideClone.style.display = 'block';
            slideClone.style.position = 'relative';
            slideClone.style.width = `${width}px`;
            slideClone.style.height = `${height}px`;

            const container = document.createElement('div');
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.appendChild(slideClone);

            document.body.appendChild(container);  // Append to body to ensure proper rendering

            html2canvas(container, { backgroundColor: '#ffffff' }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg');
                pdf.addImage(imgData, 'JPEG', 0, 0, width, height);

                if (index < slides.length - 1) {
                    pdf.addPage();
                }
                document.body.removeChild(container);  // Clean up the container
                resolve();
            });
        });
    };

    const slidePromises = Array.from(slides).map((slideContent, index) => processSlide(slideContent, index));

    Promise.all(slidePromises).then(() => {
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], 'presentation.pdf', { type: 'application/pdf' });

        if (navigator.share) {
            navigator.share({
                title: 'Presentation',
                text: 'Here is the presentation.',
                files: [file]
            }).catch(error => console.error('Error sharing:', error));
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    });
}