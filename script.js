let createIcon = document.querySelector('.new-entry');
let createEnv = document.querySelector('.new-selector');
const createButton = document.querySelector('.create-button');

let searchItem = document.querySelector('.search-item img');
let searchBar = document.querySelector('.searchbar');
let searchInput = document.getElementById('userSearch');
let searchButton = document.querySelector('.search-go');

let closeBoard = document.querySelectorAll('.board-close');
let newBoard = document.querySelector('.add-board');

let activeBoard = document.querySelector('.board.active') || null;
let activeId = '';

let boards = document.querySelectorAll('.board');
let boardTabs = document.querySelectorAll('.board-tab');




let postContainer = JSON.parse(localStorage.getItem('permanentContainer')) || {'1': {}};
document.addEventListener('DOMContentLoaded', () => {
  postContainer = JSON.parse(localStorage.getItem('permanentContainer')) || {};

  Object.keys(postContainer).forEach((boardID) => {
    createOnload(boardID);

    Object.keys(postContainer[boardID]).forEach((postItKey) => {
      const postItData = postContainer[boardID][postItKey];
      if (postItData.text && postItData.x !== undefined && postItData.y !== undefined) {

        createDivOnLoad(boardID, postItKey, postItData.text, postItData.color, postItData.x, postItData.y);

      }
    });

  const firstTab = document.querySelector('.board-tab');
  if (firstTab) {
    firstTab.classList.add('active');
    const firstBoard = document.getElementById(firstTab.id.replace('tab', ''));
    if (firstBoard) {
      firstBoard.classList.add('active');
      activeId = document.querySelector('.board.active').id;
    }
  }
  
})})




//thsi should be good to go
let saveBtn = document.querySelector('.save1');

saveBtn.addEventListener('click', () => {
  localStorage.setItem('permanentContainer', JSON.stringify(postContainer));
  console.log(postContainer);
});




//Create a board

function createOnload(id) {
  const boardCont = document.querySelector('.boards-container');
  const boardNav = document.querySelector('.boards-nav');
  const boardNum = boardNav.children.length;

  const newBoard = document.createElement('div');

  newBoard.classList.add('board', `board${id}`, 'active');
  newBoard.id = `${id}`;
  boardCont.appendChild(newBoard);

  const boardTab = document.createElement('div');
  boardTab.classList.add('board-tab');
  boardTab.id = `tab${id}`;

  boardNav.appendChild(boardTab);

  const boardTabTitle = document.createElement('span');
  boardTabTitle.textContent = postContainer[id].boardTitle;
  boardTabTitle.classList.add('board-title', `board-title${id}`);
  boardTab.appendChild(boardTabTitle);

  const boardClose = document.createElement('img');
  boardClose.src = './close.png';
  boardClose.classList.add('board-close');
  boardTab.appendChild(boardClose);

}

function createBoard() {
  const boardCont = document.querySelector('.boards-container');
  const boardNav = document.querySelector('.boards-nav');
  const boardNum = boardNav.children.length;

  const newBoard = document.createElement('div');

  newBoard.classList.add('board', `board${boardNum}`, 'active');
  newBoard.id = `${boardNum}`;
  boardCont.appendChild(newBoard);

  const boardTab = document.createElement('div');
  boardTab.classList.add('board-tab');
  boardTab.id = `tab${boardNum}`;
  boardNav.appendChild(boardTab);

  const boardTabTitle = document.createElement('span');
  boardTabTitle.textContent = `Untitled(${boardNum})`;
  boardTabTitle.classList.add('board-title', `board-title${boardNum}`);
  boardTab.appendChild(boardTabTitle);

  const boardClose = document.createElement('img');
  boardClose.src = './close.png';
  boardClose.classList.add('board-close');
  boardTab.appendChild(boardClose);

  postContainer[boardNum] = {
    boardTitle: boardTabTitle.textContent, // Store the initial title
  };

  switchBoard(boardTab);


}

newBoard.addEventListener('click', () => {
  createBoard();

});

function deleteBoard(board) {
  let boardTabDel = document.getElementById(`tab${board.id}`)

  delete postContainer[board.id];

  board.remove();
  boardTabDel.remove();
  console.log(postContainer);
  return postContainer;
};

function makeEditable(target) {
  target.setAttribute('contenteditable', 'true');

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      target.textContent = target.textContent.trim();
      target.removeAttribute('contenteditable')
      
    let clickedIdArray = Array.from(target.parentElement.id);
    let clickedId = clickedIdArray[clickedIdArray.length - 1];

    postContainer[clickedId].boardTitle = target.textContent;

    return postContainer;

    }
  })
}


  
function switchBoard(clicked) {

  console.log(clicked)

  boards = document.querySelectorAll('.board');
  boardTabs = document.querySelectorAll('.board-tab');

  boards.forEach((board) => {
    if (board.classList.contains('active')) {
      board.classList.remove('active');
    }
  });

  boardTabs.forEach((tab) => {
    if (tab.classList.contains('active')) {
      tab.classList.remove('active');
    }
  });
  
  clicked.classList.add('active');
  let clickedIdArray = Array.from(clicked.id);
  let clickedId = clickedIdArray[clickedIdArray.length - 1];

  // need to activate the corresponding board 
  document.getElementById(`${clickedId}`).classList.add('active');

  
  activeId = document.querySelector('.board.active').id;
};


// boardTabs.forEach((tab) => {
//   tab.addEventListener('click', () => {
//     console.log('clicked')
//     switchBoard(tab);
//   })
// })

const boardNav = document.querySelector('.boards-nav');

boardNav.addEventListener('click', (event) => {
  if (event.target.classList.contains('board-tab')) {
    switchBoard(event.target); 
  } else if (event.target.classList.contains('board-close')) {
    let parentIdNum = Array.from(event.target.parentElement.id);
    let targetBoard = document.getElementById(parentIdNum[parentIdNum.length - 1])
    deleteBoard(targetBoard);
  } else if (event.target.classList.contains('board-title')) {
    makeEditable(event.target)
  }
});

function createDiv(title, text, color, x, y) {
  const divBorder = document.createElement('div');
  const div = document.createElement('div');
  let divTitle = document.createElement('div');
  let divText = document.createElement('div');
  const container = document.querySelector('.board.active');
  const divClose = document.createElement('button');
  const divCloseIcon = document.createElement('img');

  div.classList.add('div-container');
  if (!color || typeof color !== 'string' || color.trim() === '' || color === 'null') {
    color = 'rgb(255, 213, 0)';
  }

  div.style.backgroundColor = color;
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;

  divTitle.classList.add('div-title');
  divTitle.textContent = title;

  divText.classList.add('div-text');
  divText.textContent = text;

  divBorder.classList.add('div-border');
  divClose.classList.add('div-close');

  divCloseIcon.src = './close.png';

  container.appendChild(div);
  div.appendChild(divBorder);
  div.appendChild(divTitle);
  div.appendChild(divText);
  divBorder.appendChild(divClose);
  divClose.appendChild(divCloseIcon);
}

function createDivOnLoad(board, title, text, color, x, y) {
  const divBorder = document.createElement('div');
  const div = document.createElement('div');
  let divTitle = document.createElement('div');
  let divText = document.createElement('div');
  const container = document.getElementById(board);
  const divClose = document.createElement('button');
  const divCloseIcon = document.createElement('img');

  div.classList.add('div-container');
  if (!color || typeof color !== 'string' || color.trim() === '' || color === 'null') {
    color = 'rgb(255, 213, 0)';
  }

  div.style.backgroundColor = color;
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;

  divTitle.classList.add('div-title');
  divTitle.textContent = title;

  divText.classList.add('div-text');
  divText.textContent = text;

  divBorder.classList.add('div-border');
  divClose.classList.add('div-close');

  divCloseIcon.src = './close.png';

  container.appendChild(div);
  div.appendChild(divBorder);
  div.appendChild(divTitle);
  div.appendChild(divText);
  divBorder.appendChild(divClose);
  divClose.appendChild(divCloseIcon);
}

// const customAlert = document.querySelector('.custom-alerter');
// let alertMsg = ['ADDED', 'ERROR'];

createButton.addEventListener('click', () => {
  function createObject(title, text, color) {
    if (!color || typeof color !== 'string' || color.trim() === '' || color === 'null') {
      color = 'rgb(255, 213, 0)';
    }

    console.log(activeId)

    
    postContainer[activeId][title] = {
      text: text,
      color: color,
      x: Math.random() * 400,
      y: Math.random() * 400,
    };
  }

  let inputTitle = document.getElementById('newTitle');
  let inputText = document.getElementById('stringInput');
  let inputColor = colorSelect;

  let newTitle = inputTitle.value;
  let newText = inputText.value;
  let newColor = inputColor;

  if (newTitle.length > 0 && newText.length > 0) {
    createObject(newTitle, newText, newColor);
    createDiv(newTitle, newText, newColor, Math.random() * 1000, Math.random() * 600);

    inputTitle.value = '';
    inputText.value = '';
    inputColor.value = '#fff';

  }

});

 



createEnv.style.display = 'none';



let colorOptions = document.querySelectorAll('.color-options button');
let colorSelect = '';

colorOptions.forEach((button) => {
  button.addEventListener('click', () => {
    colorOptions.forEach((button) => {
      button.style.border = 'solid 3px white';
    });
    colorSelect = window.getComputedStyle(button).backgroundColor;
    button.style.border = 'solid 6px white';
    createButton.style.backgroundColor = colorSelect;
    createButton.style.color = 'rgb(0,0,0)';
    createButton.style.fontWeight = 800;
    console.log('current color: ' + colorSelect);
  });
});



function deleteBox(box) {
  let title = box.querySelector('.div-title').textContent;

  delete postContainer[activeId][title];

  box.remove();
  console.log(postContainer);
  return postContainer;
}
document.addEventListener('click', (event) => {
  if (event.target && event.target.matches('.div-close img')) {
    console.log('clicked');
    console.log(event.target.closest('.div-container'));
    deleteBox(event.target.closest('.div-container'));
  }
});






createIcon.addEventListener('click', () => {
  if (createEnv.style.display === 'none') {
    createEnv.style.display = 'flex';
    createIcon.classList.toggle('activated');
    createEnv.classList.toggle('moved');
  } else {
    createEnv.style.display = 'none';
    createIcon.classList.toggle('activated');
    createEnv.classList.toggle('moved');
  }
});


document.querySelector('.boards-container').addEventListener('mousedown', (e) => {
  const box = e.target.closest('.div-container'); 
  if (!box) return;

  // Shift+Click to edit
  if (e.shiftKey) {
    box.setAttribute('contenteditable', 'true');
    box.focus();

    function stopEditing(event) {
      if (event.type === 'blur' || (event.type === 'keydown' && event.key === 'Enter')) {
        const title = box.querySelector('.div-title').textContent.trim();
        const content = box.querySelector('.div-text').textContent.trim();
        const activeId = document.querySelector('.board.active').id;

        // Update postContainer structure
        if (postContainer[activeId][title]) {
          postContainer[activeId][title].text = content;
        }

        // Save to localStorage
        localStorage.setItem('permanentContainer', JSON.stringify(postContainer));

        // Remove editable state
        box.removeAttribute('contenteditable');
        box.removeEventListener('blur', stopEditing);
        box.removeEventListener('keydown', stopEditing);
      }
    }

    box.addEventListener('blur', stopEditing);
    box.addEventListener('keydown', stopEditing);
    return;
  }

  // Drag functionality
  let isDragging = false;
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
    if (isDragging) {
      const activeId = document.querySelector('.board.active').id;
      const title = box.querySelector('.div-title').textContent.trim();

      // Update coordinates in postContainer
      if (postContainer[activeId][title]) {
        postContainer[activeId][title].x = box.offsetLeft;
        postContainer[activeId][title].y = box.offsetTop;
      }

      // Save to localStorage
      localStorage.setItem('permanentContainer', JSON.stringify(postContainer));
    }

    document.removeEventListener('mousemove', moveBox);
    document.removeEventListener('mouseup', endDrag);
  }

  document.addEventListener('mousemove', moveBox);
  document.addEventListener('mouseup', endDrag);
});



//Search
document.addEventListener('DOMContentLoaded', () => {
  searchItem.addEventListener('click', () => {
    if (!searchBar.classList.contains('searching')) {
      searchItem.src = './close-edit.png'
      searchBar.classList.add('searching');
    } else {
      searchBar.classList.remove('searching');
      searchItem.src = './search.png'
    }
  });

function handleSearch() {
  const searchString = searchInput.value.toLowerCase().trim();
  console.log('Search string:', searchString);

  const matchingKeys = Object.keys(postContainer).filter((title) =>
    title.toLowerCase().includes(searchString)
  );

  if (matchingKeys.length > 0) {
    let highlightTitle = matchingKeys[0];

    document.querySelectorAll('.div-container .div-title').forEach((divTitleElement) => {
      if (divTitleElement.textContent.toLowerCase().trim() === highlightTitle.toLowerCase()) {
        const parentDiv = divTitleElement.parentElement;
        parentDiv.classList.add('highlighted');

        setTimeout(() => {
          parentDiv.classList.remove('highlighted');
        }, 2000);
      }
    });
  }
}

searchButton.addEventListener('click', handleSearch);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && searchBar.classList.contains('searching')) {
    handleSearch();
  }
});
});

