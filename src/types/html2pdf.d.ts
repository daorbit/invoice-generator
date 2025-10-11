declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      [key: string]: any;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: Element | string): Html2Pdf;
    save(): Promise<void>;
    output(type: string, options?: any): Promise<any>;
    outputPdf(type?: string): Promise<any>;
    outputImg(type?: string): Promise<any>;
    then(callback: (pdf: any) => void): Html2Pdf;
    toPdf(): Html2Pdf;
    toContainer(): Html2Pdf;
    toCanvas(): Html2Pdf;
    toImg(): Html2Pdf;
    get(key: string): any;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: Element | string, options?: Html2PdfOptions): Html2Pdf;

  export default html2pdf;
}
