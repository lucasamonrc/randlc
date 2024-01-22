import './style.css';
import iconUrl from './images/icon-192.png';

interface LeetcodeList {
    name: string;
    id_hash: string;
    questions: {
        id: number;
        title: string;
        title_slug: string;
    }[];
}

interface UserList {
    id_hash: string;
    public_url: string;
    title: string;
}

(document.getElementById('icon') as HTMLImageElement).src = iconUrl;

document.getElementById('list')?.addEventListener('load', async () => {
    const strUserLists = localStorage.getItem('randlc@userLists') || '[]';
    const userLists = JSON.parse(strUserLists) as UserList[];

    const listSelect = document.getElementById('list') as HTMLSelectElement;

    userLists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id_hash;
        option.text = list.title;
        listSelect.add(option);
    });
});

document.getElementById('solve-btn')?.addEventListener('click', async () => {
    const csrfToken = await chrome.cookies.get({ url: 'https://leetcode.com', name: 'csrftoken' })
    const session = await chrome.cookies.get({ url: 'https://leetcode.com', name: 'LEETCODE_SESSION' })
    
    if (!csrfToken || !session) {
        alert('Please login to LeetCode first.');
        return;
    }

    const problemListHash = (document.getElementById('list') as HTMLSelectElement).value;

    if (!problemListHash) {
        alert('Please select a problem list. If you have no problem list, please create one.');
        return;
    }

    const res = await fetch(`https://leetcode.com/list/api/get_list/${problemListHash}`);
    const data = await res.json() as LeetcodeList;
    
    const randomProblem = data.questions[Math.floor(Math.random() * data.questions.length)];
    window.open(`https://leetcode.com/problems/${randomProblem.title_slug}/`, '_blank');
});

document.getElementById('new-btn')?.addEventListener('click', async () => {
    let listUrl = prompt('Please enter the public  URL of the problem list you want to add');

    if (!listUrl) {
        return;
    }

    if (listUrl.charAt(listUrl.length - 1) === '/') {
        listUrl = listUrl.slice(0, -1);
    }

    const idHash = listUrl.split('/').pop();

    if (!idHash) {
        alert('Invalid URL');
        return;
    }

    const res = await fetch(`https://leetcode.com/list/api/get_list/${idHash}`);
    const data = await res.json() as LeetcodeList;

    if (!data.questions.length) {
        alert('Invalid URL');
        return;
    }

    const newList: UserList = {
        id_hash: idHash,
        public_url: listUrl,
        title: data.name,
    };

    const strUserLists = localStorage.getItem('randlc@userLists') || '[]';
    const userLists = JSON.parse(strUserLists) as UserList[];

    userLists.push(newList);
    localStorage.setItem('randlc@userLists', JSON.stringify(userLists));

    const listSelect = document.getElementById('list') as HTMLSelectElement;
    const option = document.createElement('option');
    option.value = idHash;
    option.text = data.name;
    listSelect.add(option);
});