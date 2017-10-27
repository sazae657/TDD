'use strict';
import * as fs from 'fs';
import * as path from 'path';
import {Uri} from 'vscode'
export class Typo {
    public arg :string;
    public ret :string;
    public arg_cs :string;
    constructor(x:string, y:string) {
        this.arg = x;
        this.ret = y;
        this.arg_cs = x.replace(/\[.*\]\s+/, "");
    }
}

class MapperError implements Error {
    public name = 'MapperError';

    constructor(public message: string) {
    }

    toString() {
      return this.name + ': ' + this.message;
    }
}

export class Mapper {
    static TYPEMAP: { [key: string]: Typo; } = {
        'void':    new Typo('void', 'void'),
        'Bool':    new Typo('[MarshalAs(UnmanagedType.U1)] bool' , 'bool'),
        'Boolean':    new Typo('[MarshalAs(UnmanagedType.U1)] bool' , 'bool'),
        'char':    new Typo('char', 'char'),
        'char*':    new Typo('[MarshalAs(UnmanagedType.LPStr)] string', 'IntPtr'),
        'wchar_t':    new Typo('char', 'char'),
        'wchar_t*':    new Typo('[MarshalAs(UnmanagedType.LPWStr)] string', 'IntPtr'),
        'unsigned char':    new Typo('byte', 'byte'),
        'unsigned char*':    new Typo('[MarshalAs(UnmanagedType.LPStr)] string', 'IntPtr'),
        'short':    new Typo('Int16', 'Int16'),
        'Position':    new Typo('Int16', 'Int16'),
        'Position*':    new Typo('IntPtr', 'IntPtr'),
        'unsigned short':    new Typo('ushort', 'ushort'),
        'short*':    new Typo('out IntPtr', 'int'),
        'int':    new Typo('int', 'int'),
        'int*':    new Typo('out IntPtr', 'int'),
        'long':    new Typo('long', 'long'),
        'long*':    new Typo('out IntPtr', 'long'),
        'u_long':    new Typo('ulong', 'ulong'),
        'u_long*':    new Typo('out ulong', 'ulong'),
        'ulong':    new Typo('ulong', 'ulong'),
        'float':    new Typo('float', 'float'),
        'XtPointer':    new Typo('IntPtr', 'IntPtr'),
        'unsigned':    new Typo('uint', 'uint'),
        'unsigned int':    new Typo('uint', 'uint'),
        'unsigned int*':    new Typo('out IntPtr', 'uint'),
        'unsigned long':    new Typo('ulong','ulong'),
        'unsigned long*':    new Typo('out IntPtr','ulong'),
        'Screen*':    new Typo('IntPtr', 'IntPtr'),
        'XGCValues*':    new Typo('out IntPtr', 'IntPtr'),
        'XColor*':    new Typo('out XColor', 'XColor'),
        'XtGCMask':    new Typo('ulong', 'ulong'),
        'Display*':    new Typo('IntPtr', 'IntPtr'),
        'Drawable':    new Typo('IntPtr', 'IntPtr'),
        'Window':    new Typo('IntPtr', 'IntPtr'),
        'Window*':    new Typo('out IntPtr', 'IntPtr'),
        'XEvent*':    new Typo('out IntPtr', 'IntPtr'),
        'Visual*':    new Typo('out IntPtr', 'IntPtr'),
        'XVisualInfo*':    new Typo('ref XVisualInfo', 'IntPtr'),
        'VisualID':    new Typo('ulong', 'ulong'),
        'GC':    new Typo('IntPtr', 'IntPtr'),
        'Widget':    new Typo('IntPtr', 'IntPtr'),
        'Pixmap':    new Typo('IntPtr', 'IntPtr'),
        'Pixmap*':    new Typo('IntPtr', 'IntPtr'),
        'Colormap':    new Typo('IntPtr', 'IntPtr'),
        'Cursor':    new Typo('int', 'int'),
        'Pixel':    new Typo('ulong', 'ulong'),
        'Time':    new Typo('uint', 'uint'),
        'Atom':    new Typo('ulong', 'ulong'),
        'Atom*':    new Typo('IntPtr', 'IntPtr'),
        'EventMask':    new Typo('ulong', 'ulong'),
        'XID':    new Typo('int', 'int'),
        'XtGrabKind':    new Typo('int', 'int'),
        'XtEnum':    new Typo('byte', 'byte'),
        'Status':    new Typo('int', 'int'),
        'Dimension':    new Typo('int', 'int'),
        'Cardinal':    new Typo('int', 'int'),
        'Dimension*':    new Typo('[Out]out int', 'IntPtr'),
        'String':    new Typo('[MarshalAs(UnmanagedType.LPStr)] string', 'IntPtr'),
        'XtEventHandler':    new Typo('TonNurako.Xt.XtCallBack.XtEventHandler', 'TonNurako.Xt.XtCallBack.XtEventHandler'),
        'XmString':    new Typo('IntPtr', 'IntPtr'),
        'XmStringCharSet':    new Typo('IntPtr', 'IntPtr'),
        'XmFontList':    new Typo('IntPtr', 'IntPtr'),
        'XmTab':    new Typo('IntPtr', 'IntPtr'),
        'XmTab*':    new Typo('IntPtr[]', 'IntPtr[]'),
        'XmTabList':    new Typo('IntPtr', 'IntPtr'),
        'XmOffsetModel':    new Typo('OffsetModel', 'OffsetModel'),
        'XmTextPosition':    new Typo('long', 'long'),
        'XmTextPosition*':    new Typo('IntPtr', 'IntPtr'),
        'XmRendition':    new Typo('IntPtr', 'IntPtr'),
        'XmRendition*':    new Typo('IntPtr', 'IntPtr'),
        'XmRenderTable':    new Typo('IntPtr', 'IntPtr'),
        'XmMergeMode':    new Typo('MergeMode', 'MergeMode'),
        'XmToggleButtonState':    new Typo('ToggleButtonState', 'ToggleButtonState'),
        'XmTextSource':    new Typo('IntPtr', 'IntPtr'),
        'XmHighlightMode':    new Typo('HighlightMode', 'HighlightMode'),
        'XmTextDirection':    new Typo('TextDirection', 'TextDirection'),
        'XmString*':    new Typo('[MarshalAs(UnmanagedType.LPArray, ArraySubType=UnmanagedType.LPStr)]IntPtr []', 'IntPtr[]'),
        'XmStringTag':    new Typo('[MarshalAs(UnmanagedType.LPStr)] string', 'IntPtr'),
        'XmStringTag*':    new Typo('[MarshalAs(UnmanagedType.LPStr)] string', 'IntPtr'),
        'ArgList':    new Typo('IntPtr[]', 'IntPtr'),
       // # X11(GC)
        'XPoint*':    new Typo('TonNurako.X11.XPoint []', 'IntPtr'),
        'XImage*':    new Typo('IntPtr', 'IntPtr'),
        'XSegment*':    new Typo('TonNurako.X11.XSegment []','IntPtr'),
        'XRectangle*':    new Typo('TonNurako.X11.XRectangle []','IntPtr'),
        'XArc*':    new Typo('TonNurako.X11.XArc []','IntPtr'),
        'XWindowAttributes*':    new Typo('out XWindowAttributes','IntPtr'),
       // # X11(font)
        'Font':    new Typo('int','int'),
        'XExtData*':    new Typo('IntPtr','IntPtr'),
        'XChar2b':    new Typo('TonNurako.X11.XChar2b','TonNurako.X11.XChar2b'),
        'XChar2b*':    new Typo('IntPtr','IntPtr'),
        'XFontProp':    new Typo('TonNurako.X11.XFontProp','TonNurako.X11.XFontProp'),
        'XFontProp*':    new Typo('IntPtr','IntPtr'),
        'XCharStruct':    new Typo('TonNurako.X11.XCharStruct','TonNurako.X11.XCharStruct'),
        'XCharStruct*':    new Typo('IntPtr','IntPtr'),
        'XFontStruct':    new Typo('TonNurako.X11.XFontStruct','TonNurako.X11.XFontStruct'),
        'XFontStruct*':    new Typo('IntPtr','IntPtr'),
        //#Xm(X11Ev)
        'XButtonPressedEvent*':    new Typo('TonNurako.Xt.XEventStruct.XButtonEvent','TonNurako.Xt.XEventStruct.XButtonEvent'),
        //# X11 key
        'KeySym':    new Typo('int', 'int'),
        'KeySym*':    new Typo('IntPtr', 'IntPtr'),
        'KeyCode':    new Typo('int', 'int'),
        'XtTranslations':    new Typo('IntPtr', 'IntPtr'),
        'XtAccelerators':    new Typo('IntPtr', 'IntPtr'),

        //#X11(text)
        'XTextProperty*':    new Typo('IntPtr', 'IntPtr'),
        'XSetWindowAttributes*':    new Typo('IntPtr', 'IntPtr'),
        'XClassHint':    new Typo('XClassHint', 'XClassHint'),
        'XClassHint*':    new Typo('out XClassHint', 'XClassHint'),
        'XWMHints*':    new Typo('out XWMHints', 'XWMHints'),
        'XWindowChanges*':    new Typo('ref XWindowChanges', 'XWindowChanges'),
        'XModifierKeymap*':    new Typo('ref XModifierKeymap', 'IntPtr'),
        'XSizeHints*':    new Typo('ref XSizeHints', 'IntPtr'),
        'XTimeCoord*':    new Typo('ref XTimeCoord', 'IntPtr'),
        'XFontSet':    new Typo('IntPtr', 'IntPtr'),
        'XFontSetExtents*':    new Typo('IntPtr', 'IntPtr'),
        'XICCEncodingStyle':    new Typo('XICCEncodingStyle', 'XICCEncodingStyle'),
        'XRegion':    new Typo('ref XRegion', 'IntPtr'),
        'Region':    new Typo('IntPtr', 'IntPtr'),
        'XPoint':    new Typo('XPoint', 'XPoint'),
        // #render

        'XRenderPictFormat*':    new Typo('IntPtr', 'IntPtr'),
        'Picture':    new Typo('PictureInt', 'PictureInt'),
        'XFixed':    new Typo('int', 'int'),
        'XFixed*':    new Typo('int[]', 'int[]'),
        'XRenderPictureAttributes*':    new Typo('ref XRenderPictureAttributesRec', 'IntPtr'),
        'XRenderColor*':    new Typo('ref XRenderColor', 'IntPtr'),
        'XTrapezoid*':    new Typo('ref XTrapezoid', 'IntPtr'),
        'XLinearGradient*':    new Typo('ref XLinearGradient', 'IntPtr'),
        'XRadialGradient*':    new Typo('ref XRadialGradient', 'IntPtr'),
        'XConicalGradient*':    new Typo('ref XConicalGradient', 'IntPtr'),
        'XIndexValue*':    new Typo('ref XIndexValue', 'IntPtr'),
        'XFilters*':    new Typo('ref XFilters', 'IntPtr'),
        'XTransform*':    new Typo('ref XTransform', 'IntPtr'),
        'XTriangle*':    new Typo('ref XTriangle', 'IntPtr'),
        'XPointFixed*':    new Typo('ref XPointFixed', 'IntPtr'),
        'XPointDouble*':    new Typo('ref XPointDouble', 'IntPtr'),
    };
    localPath :string;
    localMap : { [key: string]: Typo; };
    public constructor() {
        this.localMap = Mapper.TYPEMAP;
    }

    public Map(t :string): Typo
    {   const r = Mapper.TYPEMAP[t];
	    if(r) {
            return r;
        }
        throw new MapperError(`Unknown Type <${t}>`);
    }

    public SetLocalPath(uri: Uri) {
        this.localPath = uri.fsPath;
    }

    public ResolveLocalMapPath() : string{
        const fp = path.join(this.localPath, 'tnk.typemap.json');
        return fp;
    }

    public MergeLoalMap() {
        const fp = this.ResolveLocalMapPath();
        fs.exists(fp, (e:boolean)=> {
            if(!e) {
                return;
            }
            fs.readFile(fp,(e, d)=>{
                if(!d) {
                    return;
                }
                const j = JSON.parse(d.toString());
                Object.keys(j).forEach((key) =>{
                    //if (key in this.localMap) {
                    //    return;
                    //}
                    const v = j[key];
                    this.localMap[key] =
                        new Typo(v.arg, v.ret);
                });

            });
        });
    }

    public SaveTypeMap() :string {
        const fp = this.ResolveLocalMapPath();
        fs.exists(fp, (e:boolean)=> {
            if(!e) {
                fs.writeFileSync(fp, JSON.stringify(Mapper.TYPEMAP, null, '  '));
            }
        });
        return fp;
    }
}
