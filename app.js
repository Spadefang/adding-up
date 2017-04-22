'use strict';
//fsモジュール呼び出してfs変数へ代入
//fsモジュール＝ファイルを扱うことができるようになる
//importみたいなものだと思うが、書き方がわかりづらいな。これがJSルール？
//参考：http://sakamock.hatenablog.com/entry/2016/02/03/091623
const fs = require('fs');

//readlineモジュール呼び出してreadline変数へ代入
//readlineモジュール=ファイルを1行ずつ読み込めるようにする
//importみた（ｒｙ
const readline = require('readline');

//fsモジュールに./popu-pref.csvのパスを与えると、このファイルを扱えるようになる
const rs = fs.ReadStream('./popu-pref.csv');

//raadlineモジュールにrsを与えると、1行ずつ読んでくれる
//createInterfaceでAPIを呼び出している。
//inputはrs,outputは無し
const rl = readline.createInterface({ 'input': rs, 'output': {}});

const map = new Map(); //key:都道府県 value:集計データのオブジェクト

//lineイベント監視して、発生したら、=>以降の無名関数を実行
//なぜイベント監視しないといけないのか？ = node.jsは非同期のため、トリガを与えないといけない
//lineString = 引数 = 1行受け取った文字列
rl.on('line', (lineString) => { 
    //lineString文字列をカンマ区切りでcolomns配列に格納
    const columns = lineString.split(',');
    //配列0番目が年なのでyearに格納.parseIntで文字→数値変換
    const year = parseInt(columns[0]);
    //同様に都道府県
    const prefecture = columns[2];
    //同様に人口
    const popu = parseInt(columns[7]);
    if (year === 2010 || year === 2015) {
        let value = map.get(prefecture); //prefecture変数の値を取る

        //最初はprefectureに値がないのでfalsy.その際はvalueオブジェクト初期化
        if(!value){
            value = {
                p10:0, //p10=2010人口,初期値0
                p15:0, //同様にp15
                change:null //change=変化率, 初期値null
            };
        }
        //value定義した後はこちらの処理で、連想配列に保存
        if (year === 2010){
            value.p10 += popu;
        }
        if (year === 2015){
            value.p15 += popu;
        }
        map.set(prefecture, value); //都道府県の添字に作ったvalueを登録
    }
});

//streamに情報を流し始める（ファイルを実際に読み始める）
rl.resume();
rl.on('close', () => {
    //for-of構文 mapリストの中身をof前の変数に代入
    for(let pair of map){
        const value = pair[1]; //pair[1]=map[1]だからmapのvalueオブジェクト(p10,p15,change)
        value.change = value.p15 / value.p10;
    }

    //Array.from(map)で連想リスト→通常リスト変換
    //sort関数を読んで無名関数（比較関数）を渡す
    //バブルソート？p2>p1ならp2を前にすることで降順。（前にしたい要素 -　後にしたい要素）って覚えれば。
    const rankingArray = Array.from(map).sort((p1,p2) => {
        return p2[1].change - p1[1].change;
    });
    const rankingStrings = rankingArray.map((p) => {
        return p[0] + ':' + p[1].p10 + '=>' + p[1].p15 + ' 変化率：' + p[1].change; 
    });
    console.log(rankingStrings);
});

