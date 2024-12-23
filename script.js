

let createIcon = document.querySelector('.new-entry');
let createEnv = document.querySelector('.new-selector');
const createButton = document.querySelector('.create-button');
let searchItem = document.querySelector('.search-item .fa-solid');
let searchBar = document.querySelector('.searchbar');
let searchInput = document.getElementById('userSearch')
let searchButton = document.querySelector('.search-go');
let deleteZone = document.querySelector('.delete-area');

// const controller = document.querySelector('.nav-main-container');
// let isDragging = false;
// let offsetX, offsetY;

// controller.addEventListener('mousedown', (e) => {
//     isDragging = true;

//     offsetX = e.clientX - controller.getBoundingClientRect().left;
//     offsetY = e.clientY - controller.getBoundingClientRect().top;

//     controller.style.cursor = 'grabbing';
// });

// document.addEventListener('mousemove', (e) => {
//     if (!isDragging) return;

//     let newLeft = e.clientX - offsetX;
//     let newTop = e.clientY - offsetY;

//     // Clamp within the screen
//     newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - controller.offsetWidth));
//     newTop = Math.max(0, Math.min(newTop, window.innerHeight - controller.offsetHeight));

//     controller.style.left = `${newLeft}px`;
//     controller.style.top = `0px`;
// });

// document.addEventListener('mouseup', () => {
//     if (!isDragging) return;

//     isDragging = false;
//     controller.style.cursor = 'grab';

//     const controllerRect = controller.getBoundingClientRect();
// });



const customAlert = document.querySelector('.custom-alerter');
let alertMsg = [
  'ADDED',
  'ERROR'
]

createEnv.style.display = 'none';






let saveBtn = document.querySelector('.save1');
let postContainer = JSON.parse(localStorage.getItem('permanentContainer')) || {};

saveBtn.addEventListener('click', () => {
  localStorage.setItem('permanentContainer', JSON.stringify(postContainer));
  console.log(postContainer)
})

function createDiv(title, text, color, x, y) {
  const div = document.createElement('div')
  let divTitle = document.createElement('div')
  let divText = document.createElement('div')
  const container = document.getElementById('board');

  div.classList.add('div-container');
  if (!color || typeof color !== 'string' || color.trim() === '' || color === 'null') {
    color = 'rgb(255, 213, 0)';
  }

  div.style.backgroundColor = color;
  
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;

  divTitle.classList.add('div-title')
  divTitle.textContent = title;

  divText.classList.add('div-text');
  divText.textContent = text;

  container.appendChild(div);
  div.appendChild(divTitle);
  div.appendChild(divText);
}



// Load w/ all previous posts

document.addEventListener('DOMContentLoaded', () => {
  postContainer = JSON.parse(localStorage.getItem('permanentContainer')) || {};

  for (let title in postContainer) {
    let {text, color, x, y} = postContainer[title];
    createDiv(title, text, color, x, y);
  }
})

let colorOptions = document.querySelectorAll('.color-options button');
let colorSelect = '';


colorOptions.forEach((button) => {
  button.addEventListener('click', () => {
    colorOptions.forEach((button) => {
      button.style.border = 'solid 3px white';
    })
    colorSelect = window.getComputedStyle(button).backgroundColor;
    button.style.border = 'solid 6px white';
    createButton.style.backgroundColor = colorSelect;
    createButton.style.color = 'rgb(0,0,0)';;
    createButton.style.fontWeight = 800;
    console.log('current color: ' + colorSelect);
  })
  
})


createButton.addEventListener('click', () => {
  
  function createObject(title, text, color) {
    if (!color || typeof color !== 'string' || color.trim() === '' || color === 'null') {
      color = 'rgb(255, 213, 0)';
    }
    postContainer[title] = {
      text: text,
      color: color,
      x: (Math.random()*1200),
      y: (Math.random()*600)
    }
  }

  let inputTitle = document.getElementById('newTitle');
  let inputText = document.getElementById('stringInput');
  let inputColor = colorSelect;
   
  let newTitle = inputTitle.value;
  let newText = inputText.value;
  let newColor = inputColor;

  console.log(newTitle.length)

  if(newTitle.length > 0 && newText.length > 0) {
    createObject(newTitle, newText, newColor);
    createDiv(newTitle, newText, newColor);
    
    inputTitle.value = '';
    inputText.value = '';
    inputColor.value = '#fff';

    document.querySelector('.alert-msg').textContent = alertMsg[0];
    customAlert.style.display = 'flex';
    setTimeout(() => {
      customAlert.style.display = 'none'
    }, 1500)
    
  } else {
    document.querySelector('.alert-msg').textContent = alertMsg[1];
    customAlert.style.display = 'flex';
    setTimeout(() => {
      customAlert.style.display = 'none'
    }, 1000)
  }
})





function deleteBox(box) {
  let title = box.querySelector('.div-title').textContent;

  delete postContainer[title];
  

  box.remove();
  console.log(postContainer);
  return postContainer;
}


createIcon.addEventListener('click', () => {
  if(createEnv.style.display === 'none') {
    createEnv.style.display = 'flex';
    createIcon.classList.toggle('activated');
    createEnv.classList.toggle('moved');
    
  } else {
    createEnv.style.display = 'none';
    createIcon.classList.toggle('activated');
    createEnv.classList.toggle('moved');
  }
})

document.addEventListener('DOMContentLoaded', () => {
  searchItem.addEventListener('click', () => {
    // Check if the 'searching' class is not present on the searchBar
    if (!searchBar.classList.contains('searching')) {
      searchItem.style.opacity = 0;
      searchBar.classList.add('searching');
      document.querySelector('.close').classList.toggle('rotatedd'); // Corrected typo here
    } else {
      searchBar.classList.remove('searching');
      document.querySelector('.close').classList.remove('rotatedd');
      searchItem.style.opacity = 1;
    }
  });



  function handleSearch() {
    const searchString = searchInput.value.toLowerCase().trim();
    console.log('Search string:', searchString); 
  
    const matchingKeys = Object.keys(postContainer).filter(title =>
      title.toLowerCase().includes(searchString)
    );

    if (matchingKeys.length > 0) {
      let highlightTitle = matchingKeys[0]; // Use the first matching title

      // Loop through all .div-title elements
      document.querySelectorAll('.div-container .div-title').forEach(divTitleElement => {
        // Check if the title matches
        if (divTitleElement.textContent.toLowerCase().trim() === highlightTitle.toLowerCase()) {
          const parentDiv = divTitleElement.parentElement;
          parentDiv.classList.add('highlighted');
          
          // Remove the 'highlighted' class after 2 seconds
          setTimeout(() => {
            parentDiv.classList.remove('highlighted');
          }, 2000); // 2000 ms = 2 seconds
        }
      });
    }
  }

  searchButton.addEventListener('click', handleSearch);

// Event listener for pressing the Enter key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && searchBar.classList.contains('searching')) {
      handleSearch();
    }
})}
)





document.getElementById('board').addEventListener('mousedown', (e) => {
  if (e.shiftKey) {
    const box = e.target.closest('.div-container'); 
  if (!box) return;

  let isDragging = false;
  let dragTimeout;

  const offsetX = e.clientX - box.offsetLeft;
  const offsetY = e.clientY - box.offsetTop;

  function moveBox(moveEvent) {
    isDragging = true;
    const newLeft = moveEvent.clientX - offsetX;
    const newTop = moveEvent.clientY - offsetY;

    box.style.left = `${newLeft}px`;
    box.style.top = `${newTop}px`;
  }

  function endDrag() {
    clearTimeout(dragTimeout);
    if (isDragging) {
      const title = box.querySelector('.div-title').textContent;
      postContainer[title].x = box.offsetLeft;
      postContainer[title].y = box.offsetTop;
      console.log("Updated postContainer: ", postContainer);
    }
    document.removeEventListener('mousemove', moveBox);
    document.removeEventListener('mouseup', endDrag);
  }

  function cancelDragOnEscape(event) {
    if (event.key === 'Escape') {
      console.log('Drag canceled via Escape key');
      endDrag();
    }
  }


  dragTimeout = setTimeout(() => {
    document.addEventListener('mousemove', moveBox);
    document.addEventListener('mouseup', endDrag, { once: true });
    document.addEventListener('keydown', cancelDragOnEscape, { once: true });
  }, 200); // Add a short delay to prevent interference with double-click
}});




  
  

document.getElementById('board').addEventListener('click', (e) => {
  e.preventDefault(); // Prevent the default context menu from showing
  const box = e.target.closest('.div-container'); 

  if (!box) return;


  box.setAttribute('contenteditable', 'true');
  box.focus(); 

  function stopEditing(event) {
    if (event.type === 'blur' || (event.type === 'keydown' && event.key === 'Enter')) {
      
      const title = box.querySelector('.div-title').textContent; 
      const content = box.querySelector('.div-text').textContent; 

      postContainer[title].text = content;
      postContainer[title] = title;

      box.removeAttribute('contenteditable');
      box.removeEventListener('blur', stopEditing);
      box.removeEventListener('keydown', stopEditing);

      console.log('Saved:', postContainer);
    }
  }

  // Add event listeners to exit editing mode
  box.addEventListener('blur', stopEditing);
  box.addEventListener('keydown', stopEditing);


});