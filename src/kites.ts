import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import * as winston from "winston";
import * as appRoot from "app-root-path";
import * as nconf from "nconf";

import { EventEmitter } from "events";
import { EventCollectionEmitter } from "./engine/event-collection";

