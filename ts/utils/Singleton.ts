module utils {
    export class Singleton {
        private _initialized: boolean;

        private _setSingleton(): void {
            if (this._initialized) throw Error('Singleton is already initialized.');
            this._initialized = true;
        }

        get setSingleton() { return this._setSingleton; }
    }
}