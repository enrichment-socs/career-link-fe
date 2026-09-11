import pkg from 'file-saver';

const exportToTxt = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    pkg.saveAs(blob, `${name}.txt`);
};

export { exportToTxt };
