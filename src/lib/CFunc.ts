'use strict';
export class ArgDecl {
    public type:string;
    public name:string;
    public modifier:string;
    constructor(x:string, y:string, z:string) {
        this.type = x;
        this.name = y;
        this.modifier = z;
    }
}

export class FuncDecl {
    public ret: string;
    public func: string;
    public args: ArgDecl[];
    constructor(x:string, y:string) {
        this.ret = x;
        this.func = y;
        this.args = new Array<ArgDecl>();
    }
    public AddArg(arg:ArgDecl) {
        this.args.push(arg);
    }
}

export class CFunc {

    private genPrp(lparam:string[], rparam:string[]) : FuncDecl {
        let r = lparam[0];
        let f = lparam[1];
        if (lparam.length > 2) {
            r = lparam.slice(0, lparam.length-1).join(' ');
            f = lparam[lparam.length-1];
        }
        if(f.startsWith('*')) {
            const li = f.lastIndexOf('*') +1;
            r = r + f.substr(0, li);
            f = f.substr(li);
        }
        let rpm = new FuncDecl(r, f);
        for(let a of rparam){
            a = a.trim();
            if(a.length == 0) {
                continue;
            }
            let ag = a.split(/[\s\t]+/)
            let t = ag[0];
            let n = ag[1];
            let la = ag.length;
            let modifier = "";
            if(la > 2) {
                if (t.match(/(_X)?[Cc]onst/)) {
                    modifier = t;
                    t=ag[la-2]
                }
                else {
                    t=ag.slice(0, la-1).join(' ');
                }
                n=ag[la-1]
            }
            if (!n) {
                if (t === 'void') {
                    continue;
                }
                throw new SyntaxError(`引数の書式がおかしい: ${ag}`);
            }

            if(n.startsWith('*')) {
                const li = n.lastIndexOf('*') +1;
                t = t + n.substr(0, li);
                n = n.substr(li);
            }
            rpm.AddArg(new ArgDecl(t, n, modifier));
        }
        return rpm;
    }

    public Parse(str:string) : FuncDecl
    {
        let rr = str.split(/[\(|\)]/);
        let lp = rr[0].split(/[\s\t]+/)
        let rp = rr[1].split(',')
        return this.genPrp(lp, rp);
    }
}
