// 播放按钮
const playBtn = document.getElementById('play');

// 换音乐按钮
const fileElem = document.getElementById('fileElem');

let btn = null;

// 切换状态
const changeBtnState = value => {
  btn = value;
  playBtn.textContent = value.text;
};

const btnState = {
  loading: {
    text: '加载中...',
    click: () => {}
  },
  playing: {
    text: 'Stop',
    click(mv) {
      mv.stop();
    }
  },
  canPaly: {
    text: '播放',
    click(mv) {
      mv.start();
    }
  }
};

changeBtnState(btnState.loading);

const mv = new MusicVisualization({
  src: 'https://listen.moe/stream',
  onPlay: () => {
    changeBtnState(btnState.playing);
  },
  onStop: () => {
    changeBtnState(btnState.canPaly);
  },
  audioEvents: {
    canplay: () => {
      changeBtnState(btnState.canPaly);
    },
    error: () => {
      alert('加载资源失败, 请自行选择歌曲');
    }
  }
});

playBtn.addEventListener('click', function() {
  btn.click(mv);
});

fileElem.addEventListener('change', evt => {
  const files = evt.target.files;
  mv.changeMusic(files[0]);
});
