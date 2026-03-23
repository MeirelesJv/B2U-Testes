import { test, expect } from "@playwright/test";
import { config } from "../../config";
import { buscarCodigoDeBarras } from "../../database/queries";
import { closeConnection } from "../../database/connection";
